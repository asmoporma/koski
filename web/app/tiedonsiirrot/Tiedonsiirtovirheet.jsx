import React from 'baret'
import Pager from '../util/Pager'
import * as L from 'partial.lenses'
import {ReloadButton, tiedonsiirrotContentP} from './Tiedonsiirrot'
import {Tiedonsiirtotaulukko} from './Tiedonsiirtotaulukko'
import Text from '../i18n/Text'
import {OppilaitosTitle} from './Tiedonsiirtoloki'
import Atom from 'bacon.atom'
import Http from '../util/http'

export const tiedonsiirtovirheetContentP = (queryString) => {
  const pager = Pager('/koski/api/tiedonsiirrot/virheet' + queryString, L.prop('henkilöt'))

  const selected = Atom([])
  const deleting = Atom(false)

  const removeSelected = () => {
    deleting.set(true)
    Http.post('/koski/api/tiedonsiirrot/delete', {ids: selected.get()}).onValue(() => window.location.reload(true))
  }

  let contentP = deleting.not().flatMap(notDeleting => notDeleting
    ? pager.rowsP.map(({henkilöt, oppilaitos}) =>
      ({
        content: (
          <div className="tiedonsiirto-virheet">
            <ReloadButton/>
            <button className="remove-selected" disabled={selected.map(s => !s.length)} onClick={removeSelected}>Poista
              valitut
            </button>
            <span><Text name="Alla olevien opiskelijoiden tiedot ovat virhetilassa"/><OppilaitosTitle
              oppilaitos={oppilaitos}/>{'.'}</span>
            <p><Text name="Opiskelija poistuu virhelistalta"/></p>
            <Tiedonsiirtotaulukko rivit={henkilöt} showError={true} pager={pager} selected={selected}/>
          </div>
        ),
        title: 'Tiedonsiirtovirheet'
      })
    )
    : ({content: <div className="ajax-loading-placeholder"><Text name='Poistetaan...'/></div>, title: 'Tiedonsiirtovirheet'})
  ).toProperty()

  return tiedonsiirrotContentP('/koski/tiedonsiirrot/virheet', contentP)
}
