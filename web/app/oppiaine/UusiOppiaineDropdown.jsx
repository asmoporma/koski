import React from 'baret'
import Bacon from 'baconjs'
import Atom from 'bacon.atom'
import DropDown from '../components/Dropdown'
import R from 'ramda'
import {modelData, modelLookup, modelSetData} from '../editor/EditorModel'
import {deleteOrganizationalPreference, getOrganizationalPreferences} from '../virkailija/organizationalPreferences'
import {isPaikallinen, isUusi, koulutusModuuliprototypes} from '../suoritus/Koulutusmoduuli'
import {fetchAlternativesBasedOnPrototypes} from '../editor/EnumEditor'
import {elementWithLoadingIndicator} from '../components/AjaxLoadingIndicator'
import {t} from '../i18n/i18n'

export const UusiOppiaineDropdown = ({suoritukset = [], organisaatioOid, oppiaineenSuoritus, pakollinen, selected = Bacon.constant(undefined), resultCallback, placeholder, enableFilter=true, allowPaikallinen = true}) => {
  if (!oppiaineenSuoritus || !oppiaineenSuoritus.context.edit) return null
  const käytössäolevatKoodiarvot = suoritukset.map(s => modelData(s, 'koulutusmoduuli')).filter(k => !k.kieli).map(k => k.tunniste.koodiarvo)

  const setPakollisuus = oppiaineModel => pakollinen !== undefined ? modelSetData(oppiaineModel, pakollinen, 'pakollinen') : oppiaineModel

  const oppiaineModels = koulutusModuuliprototypes(oppiaineenSuoritus).map(setPakollisuus)
  const valtakunnallisetOppiaineet = fetchAlternativesBasedOnPrototypes(oppiaineModels.filter(R.complement(isPaikallinen)), 'tunniste')
  const paikallinenProto = oppiaineModels.find(isPaikallinen)
  const paikallisetOppiaineet = Atom([])
  const setPaikallisetOppiaineet = oppiaineet => paikallisetOppiaineet.set(oppiaineet.map(setPakollisuus))

  if (paikallinenProto) {
    getOrganizationalPreferences(organisaatioOid, paikallinenProto.value.classes[0]).onValue(setPaikallisetOppiaineet)
  }

  const oppiaineet = Bacon.combineWith(paikallisetOppiaineet, valtakunnallisetOppiaineet, (x,y) => x.concat(y))
    .map(aineet => aineet.filter(oppiaine => pakollinen ? !käytössäolevatKoodiarvot.includes(modelData(oppiaine, 'tunniste').koodiarvo) : true))

  const poistaPaikallinenOppiaine = oppiaine => deleteOrganizationalPreference(organisaatioOid, paikallinenProto.value.classes[0], oppiaine).onValue(setPaikallisetOppiaineet)

  return (<div className={'uusi-oppiaine'}>
    {
      elementWithLoadingIndicator(oppiaineet.map('.length').map(length => length || paikallinenProto
        ? <DropDown
          options={oppiaineet}
          keyValue={oppiaine => isUusi(oppiaine) ? 'uusi' : modelData(oppiaine, 'tunniste').koodiarvo}
          displayValue={oppiaine => isUusi(oppiaine) ? 'Lisää...' : modelLookup(oppiaine, 'tunniste').value.title}
          onSelectionChanged={resultCallback}
          selectionText={placeholder}
          newItem={allowPaikallinen && paikallinenProto}
          enableFilter={enableFilter}
          selected={selected}
          isRemovable={isPaikallinen}
          onRemoval={poistaPaikallinenOppiaine}
          removeText={t('Poista paikallinen oppiaine. Poistaminen ei vaikuta olemassa oleviin suorituksiin.')}
        />
        : null
      ))
    }
  </div>)
}
