import _ from 'lodash/fp.js'

export function replaceIotTopicRuleActionArnWithAlias (iotTopicRule, functionAlias) {
  const newRule = _.set(
    'Properties.TopicRulePayload.Actions[0].Lambda.FunctionArn',
    { Ref: functionAlias },
    iotTopicRule
  )
  return newRule
}
