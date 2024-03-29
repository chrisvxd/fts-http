import test from 'ava'
import cloneDeep from 'clone-deep'
import fs from 'fs-extra'
import { generateDefinition } from 'fts'
import { createValidator } from 'fts-validator'
import getPort from 'get-port'
import globby from 'globby'
import got from 'got'
import jsf from 'json-schema-faker'
import path from 'path'
import pify from 'pify'
import qs from 'qs'
import seedrandom from 'seedrandom'
import tempy from 'tempy'
import * as HTTP from '.'

// const fixtures = globby.sync('./fixtures/http-response-p.ts')
const fixtures = globby.sync('./fixtures/**/*.{js,ts}')

jsf.option({
  alwaysFakeOptionals: true,
  // make values generated by json-schema-faker deterministic
  random: seedrandom('NzYxNDdlNjgxYzliN2FkNjFmYjBlMTI5')
})

for (const fixture of fixtures) {
  const { name, dir } = path.parse(fixture)
  const testConfigPath = path.join(process.cwd(), dir, 'config.json')

  test.serial(name, async (t) => {
    let testConfig = {
      get: true,
      post: true,
      postArray: true
    }

    if (fs.pathExistsSync(testConfigPath)) {
      testConfig = {
        ...testConfig,
        ...require(testConfigPath)
      }
    }

    const outDir = tempy.directory()
    const definition = await generateDefinition(fixture, {
      compilerOptions: {
        outDir
      },
      emit: true
    })
    t.truthy(definition)

    const isHttpResponse = !!definition.returns.http
    const validator = createValidator()
    const paramsDecoder = validator.decoder(definition.params.schema)
    const returnsEncoder = validator.encoder(definition.returns.schema)

    const jsFilePath = path.join(outDir, `${name}.js`)
    const handler = HTTP.createHttpHandler(definition, jsFilePath)
    t.is(typeof handler, 'function')

    const port = await getPort()
    const server = await HTTP.createHttpServer(handler, port)
    const url = `http://localhost:${port}`

    const params = await jsf.resolve(definition.params.schema)
    const paramsLocal = cloneDeep(params)
    paramsDecoder(paramsLocal)
    t.is(paramsDecoder.errors, null)

    const paramsArray = definition.params.order.map((key) => params[key])
    const paramsLocalArray = definition.params.order.map(
      (key) => paramsLocal[key]
    )
    const func = HTTP.requireHandlerFunction(definition, jsFilePath)

    const result = await Promise.resolve(func(...paramsLocalArray))
    const expected = { result }
    if (!isHttpResponse) {
      returnsEncoder(expected)
      t.is(returnsEncoder.errors, null)
    } else {
      expected.result = (result.body || Buffer.from('')).toString()
    }
    const expectedEncoded = JSON.parse(JSON.stringify(expected))
    console.log({ name, params, port, expected })

    // test GET request with params as a query string
    // note: some fixtures will not support this type of encoding
    if (testConfig.get) {
      const query = qs.stringify(params)
      const temp: any = { query }
      if (!isHttpResponse) {
        temp.json = true
      }
      const responseGET = await got(url, temp)
      validateResponseSuccess(responseGET, 'GET', expectedEncoded)
    }

    // test POST request with params as a json body object
    if (testConfig.post) {
      const temp: any = { body: params }
      if (isHttpResponse) {
        temp.body = JSON.stringify(params)
        temp.headers = {
          'Content-type': 'application/json'
        }
      } else {
        temp.json = true
      }
      const responsePOST = await got.post(url, temp)
      validateResponseSuccess(responsePOST, 'POST', expectedEncoded)
    }

    // test POST request with params as a json body array
    if (testConfig.postArray) {
      const temp: any = { body: paramsArray }
      if (isHttpResponse) {
        temp.body = JSON.stringify(paramsArray)
        temp.headers = {
          'Content-type': 'application/json'
        }
      } else {
        temp.json = true
      }

      const responsePOSTArray = await got.post(url, temp)
      validateResponseSuccess(responsePOSTArray, 'POSTArray', expectedEncoded)
    }

    await pify(server.close.bind(server))()
    await fs.remove(outDir)

    function validateResponseSuccess(
      res: got.Response<object>,
      label: string,
      expected: any
    ) {
      console.log({
        body: res.body,
        label,
        statusCode: res.statusCode
      })
      t.is(res.statusCode, 200)
      const response = { result: res.body as any }

      if (result === undefined || result === null) {
        if (response.result === '') {
          response.result = result
        }
      }

      const responseEncoded = JSON.parse(JSON.stringify(response))
      t.deepEqual(responseEncoded, expected)
    }
  })
}
