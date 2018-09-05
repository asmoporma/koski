import React from 'baret'
import Text from '../i18n/Text'
import '../style/main.less'

export default ({ memberName, onAcceptClick, logoutURL }) => (
  <div className='acceptance-box'>
    <div className='acceptance-title'><Text name='Omadata hyväksyntä otsikko'/></div>
    <div className='acceptance-member-name'>{memberName}</div>
    <div className='acceptance-share-info'>
      <Text name='Palveluntarjoaja näkee'/>
      <ul>
        <li><Text name='Tiedot opiskeluoikeuksista'/></li>
        <li><Text name='Nimi ja syntymäaika'/></li>
      </ul>
    </div>
    <div className='acceptance-button-container'>
      <button className='acceptance-button koski-button' onClick={onAcceptClick}><Text name='Hyväksy'/></button>
      <a href={logoutURL}><span className='decline-link'><Text name='Peruuta ja palaa'/></span></a>
    </div>
  </div>
)
