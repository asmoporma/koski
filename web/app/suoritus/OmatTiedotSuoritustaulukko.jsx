import React from 'baret'
import {modelItems, modelLookup, modelTitle} from '../editor/EditorModel'
import {flatMapArray} from '../util/util'
import {
  ArvosanaColumn, getLaajuusYksikkö,
  groupSuoritukset, isNäyttötutkintoonValmistava, isYlioppilastutkinto,
  KoepisteetColumn,
  LaajuusColumn, suoritusProperties,
  TutkintokertaColumn
} from './SuoritustaulukkoCommon'
import {isYhteinenTutkinnonOsa} from '../ammatillinen/TutkinnonOsa'
import {PropertiesEditor} from '../editor/PropertiesEditor'
import {fetchLaajuudet, YhteensäSuoritettu} from './YhteensaSuoritettu'
import {suoritusValmis} from './Suoritus'
import {t} from '../i18n/i18n'


const OmatTiedotSuoritustaulukko = ({suorituksetModel, nested, parentSuoritus: parentSuoritusProp}) => {
  const {context} = suorituksetModel
  const parentSuoritus = parentSuoritusProp || context.suoritus
  const suoritukset = modelItems(suorituksetModel) || []

  if (suoritukset.length === 0) return null

  const groupsP = groupSuoritukset(parentSuoritus, suoritukset, context)
  const columns = [TutkintokertaColumn, SuoritusColumn, LaajuusColumn, KoepisteetColumn, ArvosanaColumn].filter(column => column.shouldShow({parentSuoritus, suorituksetModel, suoritukset, context}))

  const laajuusYksikkö = getLaajuusYksikkö(suoritukset[0])

  return (
    <div className='omattiedot-suoritus-taulukko'>
      {
        groupsP.map(groups => flatMapArray(groups.groupIds, (groupId, i) => (
          <SuoritusGroup
            key={`group-${i}`}
            groups={groups}
            groupId={groupId}
            columns={columns}
            nested={nested}
            parentSuoritus={parentSuoritus}
            laajuusYksikkö={laajuusYksikkö}
          />)))
      }
    </div>
  )
}

const SuoritusGroup = ({groups, groupId, columns, nested, parentSuoritus, laajuusYksikkö}) => {
  const groupItems = groups.grouped[groupId]
  const groupTitles = groups.groupTitles
  const ylioppilastutkinto = isYlioppilastutkinto(parentSuoritus)

  return (
    <div className='suoritus-group'>
      <table className={nested ? 'nested' : ''}>
        <thead>
          <tr className={nested ? 'nested-header' : ''}>
            {columns.map(column => column.renderHeader({groupTitles, groupId}))}
          </tr>
        </thead>
        <tbody>
          {groupItems.map((suoritus, index) => (
            <Suoritus
              model={suoritus}
              columns={columns}
              nested={nested}
              ylioppilastutkinto={ylioppilastutkinto}
              key={`suoritus-${index}`}
            />))}
        </tbody>
      </table>
      {!nested && !isNäyttötutkintoonValmistava(parentSuoritus) && !ylioppilastutkinto &&
        <YhteensäSuoritettu
          osasuoritukset={groupItems}
          laajuusP={fetchLaajuudet(parentSuoritus, groups.groupIds).map(l => l[groupId])}
          laajuusYksikkö={laajuusYksikkö}/>}
    </div>
  )
}

class Suoritus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false
    }
    this.toggleExpand = this.toggleExpand.bind(this)
  }

  toggleExpand(e) {
    e.stopPropagation()
    this.setState(prevState => ({expanded: !prevState.expanded}))
  }

  render() {
    const {model, columns, nested, ylioppilastutkinto} = this.props
    const {expanded} = this.state

    const properties = suoritusProperties(model)
    const displayProperties = properties.filter(p => p.key !== 'osasuoritukset')
    const hasProperties = displayProperties.length > 0
    const osasuoritukset = modelLookup(model, 'osasuoritukset')
    const showOsasuoritukset = (osasuoritukset && osasuoritukset.value) || isYhteinenTutkinnonOsa(model)
    const expandable = hasProperties || showOsasuoritukset

    const baseClassName = nested ? 'suoritus-row' : 'paatason-suoritus-row'
    const className = `${baseClassName} ${expanded ? `${baseClassName}--expanded` : ''} ${expandable ? 'expandable-row' : ''}`

    return [
      <tr key='suoritus' className={className} onClick={expandable ? this.toggleExpand : undefined}>
        {columns.map(column => column.renderData({model, onExpand: this.toggleExpand, expandable, expanded, ylioppilastutkinto}))}
      </tr>,
      expanded && hasProperties && <tr key='properties' className='details'>
        <td colSpan='4'>
          <PropertiesEditor model={model} properties={displayProperties} className='kansalainen' />
        </td>
      </tr>,
      expanded && showOsasuoritukset && <tr key='osasuoritukset' className='osasuoritukset'>
        <td colSpan='4'>
          <OmatTiedotSuoritustaulukko parentSuoritus={model} nested={true} suorituksetModel={osasuoritukset} />
        </td>
      </tr>
    ]
  }
}

const SuoritusColumn = {
  shouldShow : () => true,
  renderHeader: ({groupTitles, groupId}) => <th key='suoritus' className='tutkinnon-osan-ryhma' scope='col'>{groupTitles[groupId]}</th>,
  renderData: ({model, onExpand, expandable, expanded}) => {
    const suoritusTitle = suoritusValmis(model)
      ? modelTitle(model, 'koulutusmoduuli')
      : <span>{modelTitle(model, 'koulutusmoduuli')} <span className='kesken'>{`(${t('Suoritus kesken')})`}</span></span>
    return (
      <td key='suoritus' className='suoritus'>
        {expandable && (
          <div className='expanded-indicator' aria-hidden={true}>{expanded ? '-' : '+'}</div>
        )}
        {expandable
          ? <button className='inline-text-button' onClick={onExpand} aria-pressed={expanded}>{suoritusTitle}</button>
          : suoritusTitle}
      </td>
    )
  }
}

export default OmatTiedotSuoritustaulukko
