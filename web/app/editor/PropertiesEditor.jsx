import React from 'react'
import { modelEmpty, modelItems, addContext } from './EditorModel.js'
import { Editor } from './Editor.jsx'
import { ArrayEditor } from './ArrayEditor.jsx'
import {modelData, modelLookup, modelProperties} from './EditorModel'
import Text from '../Text.jsx'
import {buildClassNames} from '../classnames'

export class PropertiesEditor extends React.Component {
  render() {
    let defaultValueEditor = (prop, getDefault) => getDefault()
    let {properties, model, context, getValueEditor = defaultValueEditor, propertyFilter = () => true, propertyEditable = p => p.editable || context.editAll, className} = this.props
    if (!properties) {
      if (!model) throw new Error('model or properties required')
      properties = modelProperties(model)
    }
    if (!context) {
      if (!model) throw new Error('model or context required')
      context = model.context
    }
    let edit = context.edit
    let contextForProperty = (property) => !propertyEditable(property) && context.edit ? { ...context, edit: false } : context
    let shouldShow = (property) => shouldShowProperty(contextForProperty(property))(property) && propertyFilter(property)

    let munch = (prefix) => (property, i) => {
      if (property.flatten && property.model.value && property.model.value.properties) {
        return modelProperties(property.model, shouldShow).flatMap(munch(prefix + property.key + '.'))
      } else if (!edit && property.flatten && (property.model.type === 'array')) {
        return modelItems(property.model).flatMap((item, j) => {
          return modelProperties(item, shouldShow).flatMap(munch(prefix + j + '.'))
        })
      } else {
        let key = prefix + property.key + i
        let propertyClassName = 'property ' + property.key
        let valueClass = modelEmpty(property.model) ? 'value empty' : 'value'
        let valueEditor = property.tabular
          ? <TabularArrayEditor model={property.model} />
          : getValueEditor(property, () => <Editor model={propertyEditable(property) ? property.model : addContext(property.model, { edit: false })}/> )

        return [(<tr className={propertyClassName} key={key}>
          {
            property.complexObject
              ? (<td className="complex" colSpan="2">
              <div className="label"><Text name={property.title}/></div>
              <div className={valueClass}>{ valueEditor }</div>
            </td>)
              : [<td className="label" key="label"><Text name={property.title}/></td>,
              <td className={valueClass} key="value">{ valueEditor }</td>
            ]
          }
        </tr>)]
      }
    }

    return (<div className={ buildClassNames(['properties', className]) }>
      <table><tbody>
      { properties.filter(shouldShow).flatMap(munch('')) }
      </tbody></table>
    </div>)
  }
}
PropertiesEditor.canShowInline = () => false

export const shouldShowProperty = (context) => (property) => {
  if (!context.edit && modelEmpty(property.model)) return false
  if (property.hidden) return false
  if (property.onlyWhen && !property.onlyWhen.some(onlyWhen => {
      let onlyWhenModel = modelLookup(property.owner, onlyWhen.modelPath.split('/'))
      let data = modelData(onlyWhenModel, onlyWhen.dataPath)
      let match = onlyWhen.value == data
      //console.log(property.key, onlyWhenModel, match)
      return match
  })) return false
  return true
}

export class TabularArrayEditor extends React.Component {
  render() {
    let {model} = this.props
    let items = modelItems(model)
    if (!items.length) return null
    if (model.context.edit) return <ArrayEditor {...this.props}/>
    let properties = modelProperties(items[0])
    return (<table className="tabular-array">
      <thead>
      <tr>{ properties.map((p, i) => <th key={i}><Text name={p.title}/></th>) }</tr>
      </thead>
      <tbody>
      {
        items.map((item, i) => {
          return (<tr key={i}>
            {
              modelProperties(item).map((p, j) => {
                return (<td key={j}><Editor model = {p.model}/></td>)
              })
            }
          </tr>)
        })
      }
      </tbody>
    </table>)
  }
}