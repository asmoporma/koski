import React from 'react'
import {modelLookup} from './EditorModel.js'
import {PropertiesEditor, shouldShowProperty} from './PropertiesEditor'
import {modelProperties, wrapOptional} from './EditorModel'
import {modelProperty} from './EditorModel'
import {navigateWithQueryParams, currentLocation} from '../util/location'
import {parseBool} from '../util/util'
import Text from '../i18n/Text'

export const ExpandablePropertiesEditor = ({model, propertyName, propertyFilter = () => true}) => {
  let propertyModel = modelLookup(model, propertyName)
  let edit = model.context.edit
  let paramName = propertyName + '-expanded'
  let expanded = parseBool(currentLocation().params[paramName])
  let wrappedModel = edit ? wrapOptional(propertyModel) : propertyModel
  let toggleOpen = () => {
    navigateWithQueryParams({[paramName]: !expanded ? 'true' : undefined})
  }
  let zeroVisibleProperties = modelProperties(wrappedModel, shouldShowProperty(model.context)).filter(propertyFilter).length === 0

  return !zeroVisibleProperties || wrappedModel.context.edit ?
    <div className={'expandable-container ' + propertyName}>
      <a className={expanded ? 'open expandable' : 'expandable'} onClick={toggleOpen}><Text name={modelProperty(model, propertyName).title}/></a>
      { expanded ?
        <div className="value">
          <PropertiesEditor model={wrappedModel} propertyFilter={propertyFilter}/>
        </div> : null
      }
    </div> : null
}
