import React from 'baret'
import Bacon from 'baconjs'
import * as R from 'ramda'
import {modelData, modelItems, modelLookup, modelTitle} from '../../editor/EditorModel'
import SuoritusIdentifier from './SuoritusIdentifier'
import {suoritusjakoSuoritusTitle} from './suoritusjako'
import {suorituksenTyyppi} from '../../suoritus/Suoritus'
import {OpiskeluoikeudenTila} from '../fragments/OpiskeluoikeudenTila'
import Text from '../../i18n/Text'
import Checkbox from '../../components/Checkbox'

const isKorkeakouluSuoritus = suoritus => [
  'korkeakoulututkinto',
  'korkeakoulunopintojakso',
  'muukorkeakoulunsuoritus'
].includes(suorituksenTyyppi(suoritus))

const isIrrallinenKorkeakoulunSuoritus = suoritus => [
  'korkeakoulunopintojakso',
  'muukorkeakoulunsuoritus'
].includes(suorituksenTyyppi(suoritus))

const groupSuoritukset = suoritukset => !R.isEmpty(suoritukset)
  ? isIrrallinenKorkeakoulunSuoritus(suoritukset[0]) ? [suoritukset[0]] : suoritukset
  : []
const withIdentifiers = opiskeluoikeus => suoritukset => suoritukset.map(suoritus => ({suoritus, id: SuoritusIdentifier(opiskeluoikeus, suoritus)}))
const withoutDuplicates = suorituksetWithIdentifiers => R.uniqBy(sWithId => sWithId.id, suorituksetWithIdentifiers)

export const SelectableSuoritusList = ({opiskeluoikeudet, selectedSuoritusIds}) => {
  const toggleSelection = id => event =>
    selectedSuoritusIds.modify(ids => event.target.checked ? R.append(id, ids) : R.without([id], ids))

  return (
    <ul className='create-suoritusjako__list'>
      {
        opiskeluoikeudet.map(oppilaitoksittain => {
          const oppilaitos = modelLookup(oppilaitoksittain, 'oppilaitos')
          const groupTitle = modelTitle(oppilaitos)
          const oppilaitoksenOpiskeluoikeudet = Bacon.constant(modelItems(oppilaitoksittain, 'opiskeluoikeudet'))

          return [
            <li className='oppilaitos-group' key={groupTitle}>
              <h3 className='oppilaitos-group__header'>
                {groupTitle}
              </h3>
              <ul className='oppilaitos-group__list'>
                {
                  Bacon.combineWith(oppilaitoksenOpiskeluoikeudet, selectedSuoritusIds, (opiskeluoikeudetModels, selectedIds) =>
                    opiskeluoikeudetModels.map(oo => {
                      const identifiersWithTitles = suorituksetWithIdentifiers => suorituksetWithIdentifiers.map(
                        ({suoritus, id}) => ({
                          id,
                          Title: () => suorituksenTyyppi(suoritus) === 'korkeakoulunopintojakso'
                            ? <span>{päätasonSuoritukset.length} <Text name='opintojaksoa'/></span>
                            : (
                              <span>
                          {suoritusjakoSuoritusTitle(suoritus)}
                                {
                                  isKorkeakouluSuoritus(suoritus) && !!modelData(oo, 'alkamispäivä') &&
                                  <OpiskeluoikeudenTila opiskeluoikeus={oo}/>
                                }
                        </span>
                            )
                        }))

                      const päätasonSuoritukset = modelItems(oo, 'suoritukset')
                      const näytettävätSuoritukset = groupSuoritukset(päätasonSuoritukset)
                      const options = R.compose(identifiersWithTitles, withoutDuplicates, withIdentifiers(oo))(näytettävätSuoritukset)

                      return options.map(({id, Title}) => (
                          <li key={id}>
                            <Checkbox
                              id={id}
                              checked={R.contains(id, selectedIds)}
                              onChange={toggleSelection(id)}
                              LabelComponent={Title}
                              listStylePosition='inside'
                            />
                          </li>
                        )
                      )
                    })
                  )
                }
              </ul>
            </li>
          ]
        })
      }
    </ul>
  )
}
