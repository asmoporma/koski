import React from 'baret'
import Atom from 'bacon.atom'
import {KurssiEditor} from './KurssiEditor'
import {modelSetTitle, wrapOptional} from '../editor/EditorModel'
import {
  contextualizeSubModel,
  ensureArrayKey,
  modelData,
  modelItems,
  modelLookup,
  modelSet,
  oneOfPrototypes,
  pushModel
} from '../editor/EditorModel'
import Text from '../i18n/Text'
import {t} from '../i18n/i18n'
import {ift} from '../util/util'
import UusiKurssiPopup from './UusiKurssiPopup'

export const KurssitEditor = ({model, customTitle, customAlternativesCompletionFn, customKurssitSortFn}) => {
  let osasuoritukset = modelLookup(model, 'osasuoritukset')
  if (!osasuoritukset) return null
  let kurssit = modelItems(osasuoritukset)
  if (typeof customKurssitSortFn === 'function') {
    kurssit = kurssit.sort(customKurssitSortFn)
  }
  let kurssinSuoritusProto = createKurssinSuoritus(osasuoritukset)
  let showUusiKurssiAtom = Atom(false)
  let lisääKurssi = (kurssi) => {
    if (kurssi) {
      const nimi = t(modelData(kurssi, 'tunniste.nimi'))
      const kurssiWithTitle = nimi ? modelSetTitle(kurssi, nimi) : kurssi
      var suoritusUudellaKurssilla = modelSet(kurssinSuoritusProto, kurssiWithTitle, 'koulutusmoduuli')
      ensureArrayKey(suoritusUudellaKurssilla)
      pushModel(suoritusUudellaKurssilla, model.context.changeBus)
    }
    showUusiKurssiAtom.set(false)
  }
  const hasAvailableOsasuoritukset = () => { // Test if an osasuoritus can be added
    if(!osasuoritukset.value || !Array.isArray(osasuoritukset.value)) return true // Empty: can't be more than maxItems
    if(!osasuoritukset.maxItems || typeof osasuoritukset.maxItems !== 'number' ) return true // maxItems not specified
    return osasuoritukset.value.length < osasuoritukset.maxItems
  }

  if (!kurssit.length && !model.context.edit) return null

  return (
    <span className="kurssit"><ul>{
      kurssit.map((kurssi, kurssiIndex) =>
        <KurssiEditor key={kurssiIndex} kurssi={kurssi}/>
      )
    }</ul>
    {
      model.context.edit && hasAvailableOsasuoritukset() && (<span className="uusi-kurssi">
        <a onClick={() => showUusiKurssiAtom.set(true)}><Text name={`Lisää ${customTitle || 'kurssi'}`}/></a>
        {
          ift(showUusiKurssiAtom,
            <UusiKurssiPopup
              oppiaineenSuoritus={model}
              resultCallback={lisääKurssi}
              toimipiste={modelData(model.context.toimipiste).oid}
              uusiKurssinSuoritus={kurssinSuoritusProto}
              customTitle={customTitle}
              customAlternativesCompletionFn={customAlternativesCompletionFn}
            />
          )
        }
      </span>)
    }
    </span>
  )
}

let createKurssinSuoritus = (osasuoritukset) => {
  osasuoritukset = wrapOptional(osasuoritukset)
  let newItemIndex = modelItems(osasuoritukset).length
  let oppiaineenSuoritusProto = contextualizeSubModel(osasuoritukset.arrayPrototype, osasuoritukset, newItemIndex)
  let options = oneOfPrototypes(oppiaineenSuoritusProto)
  oppiaineenSuoritusProto = options[0]
  return contextualizeSubModel(oppiaineenSuoritusProto, osasuoritukset, newItemIndex)
}

