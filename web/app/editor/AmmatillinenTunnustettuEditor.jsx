import React from 'baret'
import Bacon from 'baconjs'
import Atom from 'bacon.atom'
import Text from '../Text.jsx'
import ModalDialog from './ModalDialog.jsx'
import {Editor} from './Editor.jsx'
import {PropertiesEditor} from './PropertiesEditor.jsx'
import {modelLookup, accumulateModelStateAndValidity, pushModelValue, resetOptionalModel} from './EditorModel.js'
import {wrapOptional} from './OptionalEditor.jsx'


const TunnustettuPopup = ({model, hasOldData, doneCallback}) => {
  const {modelP, errorP} = accumulateModelStateAndValidity(model)
  const validP = errorP.not()
  const submitB = Bacon.Bus()

  submitB.map(modelP).onValue(m => {
    pushModelValue(model, modelLookup(m, 'selite').value, 'selite')
    doneCallback()
  })

  return (
    <ModalDialog className="lisää-tunnustettu-modal" onDismiss={doneCallback} onSubmit={() => submitB.push()}  okTextKey={hasOldData ? 'Päivitä' : 'Lisää'} validP={validP}>
      <h2><Text name="Ammattiosaamisen tunnustaminen"/></h2>
      <PropertiesEditor baret-lift model={modelP} propertyFilter={p => p.key === 'selite'}/>
    </ModalDialog>
  )
}

export class AmmatillinenTunnustettuEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      popupVisibleA: Atom(false)
    }
  }

  render() {
    const model = this.props.model
    const popupVisibleA = this.state.popupVisibleA
    const edit = model.context.edit

    const wrappedModel = wrapOptional({model})
    const hasData = model.modelId !== 0

    return (
      <div>
        {popupVisibleA.map(v => v ? <TunnustettuPopup model={wrappedModel} hasOldData={hasData} doneCallback={() => popupVisibleA.set(false)}/> : null)}
        {edit && hasData && <a className="remove-value fa fa-times-circle-o" onClick={() => resetOptionalModel(wrappedModel)}></a>}
        {edit && hasData && <a className="edit-value fa fa-pencil-square-o" onClick={() => popupVisibleA.set(true)}></a>}
        {hasData && <Editor model={modelLookup(wrappedModel, 'selite')} edit={false}/>}
        {edit && !hasData &&
          <div><a className="add-value" onClick={() => popupVisibleA.set(true)}><Text name="Lisää ammattiosaamisen tunnustaminen"/></a></div>
        }
      </div>
    )
  }
}
AmmatillinenTunnustettuEditor.handlesOptional = () => true
AmmatillinenTunnustettuEditor.writeOnly = true

