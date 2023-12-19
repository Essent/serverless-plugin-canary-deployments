import _ from 'lodash/fp.js'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import chai from 'chai'

import ServerlessCanaryDeployments from './serverless-plugin-canary-deployments.js'

import AwsProvider from 'serverless/lib/plugins/aws/provider.js'
import Serverless from 'serverless/lib/serverless.js'
const { expect } = chai
const dirname = path.dirname('')
const fixturesPath = path.resolve(dirname, 'fixtures')

describe('ServerlessCanaryDeployments', () => {
  const stage = 'dev'
  const options = { stage }

  describe('addCanaryDeploymentResources', () => {
    const testCaseFiles = readdirSync(fixturesPath)
    const getTestCaseName = _.pipe(_.split('.'), _.head)
    const testCaseFileType = _.pipe(_.split('.'), _.get('[1]'))
    const testCaseContentsFromFiles = _.reduce((acc, fileName) => {
      const contents = JSON.parse(readFileSync(path.resolve(fixturesPath, fileName)))
      return _.set(testCaseFileType(fileName), contents, acc)
    }, {})
    const testCaseFilesByName = _.groupBy(getTestCaseName, testCaseFiles)
    const testCases = _.map(
      (caseName) => {
        const testCaseContents = testCaseContentsFromFiles(testCaseFilesByName[caseName])
        return Object.assign(testCaseContents, { caseName })
      },
      Object.keys(testCaseFilesByName)
    )

    testCases.forEach(({ caseName, input, output, service }) => {
      it(`generates the correct CloudFormation templates: test case ${caseName}`, () => {
        const serverless = new Serverless({ options, commands: [] })
        Object.assign(serverless.service, service)
        serverless.service.provider.compiledCloudFormationTemplate = input
        serverless.setProvider('aws', new AwsProvider(serverless, options))
        const plugin = new ServerlessCanaryDeployments(serverless, options)
        plugin.addCanaryDeploymentResources()
        expect(serverless.service.provider.compiledCloudFormationTemplate).to.deep.equal(output)
      })
    })
  })
})
