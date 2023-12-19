import { expect } from 'chai'
import _ from 'lodash/fp.js'
import { replaceIotTopicRuleActionArnWithAlias } from './Iot.js'

describe('Iot', () => {
  const iotTopicRule = {
    Type: 'AWS::IoT::TopicRule',
    Properties: {
      TopicRulePayload: {
        RuleDisabled: 'false',
        Sql: "SELECT * FROM 'some_topic'",
        Actions: [
          {
            Lambda: {
              FunctionArn: {
                'Fn::GetAtt': [
                  'HelloLambdaFunction',
                  'Arn'
                ]
              }
            }
          }
        ]
      }
    }
  }

  describe('.replaceIotTopicRuleActionArnWithAlias', () => {
    it('replaces the IoT topic rule action with a function alias ARN', () => {
      const functionAlias = 'TheFunctionAlias'
      const ruleAction = { Ref: functionAlias }
      const expected = _.set(
        'Properties.TopicRulePayload.Actions[0].Lambda.FunctionArn',
        ruleAction,
        iotTopicRule
      )
      const actual = replaceIotTopicRuleActionArnWithAlias(iotTopicRule, functionAlias)
      expect(actual).to.deep.equal(expected)
    })
  })
})
