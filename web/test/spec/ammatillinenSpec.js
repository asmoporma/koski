describe('Ammatillinen koulutus', function() {
  before(Authentication().login())
  
  var addOppija = AddOppijaPage()
  var page = KoskiPage()
  var login = LoginPage()
  var opinnot = OpinnotPage()
  var editor = opinnot.opiskeluoikeusEditor()

  function addNewOppija(username, hetu, oppijaData) {
    return function() {
      return prepareForNewOppija(username, hetu)()
        .then(addOppija.enterValidDataAmmatillinen(oppijaData))
        .then(addOppija.submitAndExpectSuccess(hetu, (oppijaData || {}).tutkinto))
    }
  }

  describe('Opiskeluoikeuden lisääminen', function() {
    describe('Olemassa olevalle henkilölle', function() {
      before(prepareForNewOppija('kalle', '280608-6619'))
      before(addOppija.enterValidDataAmmatillinen())

      describe('Tietojen näyttäminen', function() {
        it('Näytetään henkilöpalvelussa olevat nimitiedot', function() {
          expect(addOppija.henkilötiedot()).to.deep.equal(['Tero Petteri Gustaf', 'Tero', 'Tunkkila-Fagerlund' ])
        })
      })

      describe('Kun lisätään oppija', function() {
        before(addOppija.submitAndExpectSuccess('Tunkkila-Fagerlund, Tero Petteri Gustaf (280608-6619)', 'Autoalan perustutkinto'))
        it('Onnistuu, näyttää henkilöpalvelussa olevat nimitiedot', function() {
          
        })
      })
    })

    describe('Uudelle henkilölle', function() {
      before(resetFixtures, prepareForNewOppija('kalle', '230872-7258'))

      describe('Tietojen näyttäminen', function() {
        it('Näytetään tyhjät nimitietokentät', function() {
          expect(addOppija.henkilötiedot()).to.deep.equal([ '', '', '' ])
        })
      })

      describe('Kun lisätään oppija', function() {
        before(addOppija.enterValidDataAmmatillinen({suorituskieli: 'ruotsi'}))
        before(addOppija.submitAndExpectSuccess('Tyhjä, Tero (230872-7258)', 'Autoalan perustutkinto'))

        it('lisätty oppija näytetään', function() {})

        it('Lisätty opiskeluoikeus näytetään', function() {
          expect(opinnot.getTutkinto()).to.equal('Autoalan perustutkinto')
          expect(opinnot.getOppilaitos()).to.equal('Stadin ammattiopisto')
          expect(opinnot.getSuorituskieli()).to.equal('ruotsi')
        })
      })
    })

    describe('Henkilöpalvelusta löytyvälle oppijalle, jolla on OID ja Hetu', function() {
      before(resetFixtures, prepareForNewOppija('kalle', '1.2.246.562.24.99999555555'))
      describe('Tietojen näyttäminen', function() {
        it('Näytetään täydennetyt nimitietokentät', function() {
          expect(addOppija.henkilötiedot()).to.deep.equal([ 'Eino', 'Eino', 'EiKoskessa' ])
        })
        it('Hetua ei näytetä', function() {
          expect(addOppija.hetu()).equal('')
        })
      })

      describe('Kun lisätään oppija', function() {
        before(addOppija.enterValidDataAmmatillinen())
        before(addOppija.submitAndExpectSuccess('EiKoskessa, Eino (270181-5263)', 'Autoalan perustutkinto'))

        it('lisätty oppija näytetään', function() {})

        it('Lisätty opiskeluoikeus näytetään', function() {
          expect(opinnot.getTutkinto()).to.equal('Autoalan perustutkinto')
          expect(opinnot.getOppilaitos()).to.equal('Stadin ammattiopisto')
          expect(opinnot.getSuorituskieli()).to.equal('suomi')
        })
      })
    })

    describe('Henkilöpalvelusta löytyvälle oppijalle, jolla on vain OID', function() {
      before(resetFixtures, prepareForNewOppija('kalle', '1.2.246.562.24.99999555556'))
      describe('Tietojen näyttäminen', function() {
        it('Näytetään täydennetyt nimitietokentät', function() {
          expect(addOppija.henkilötiedot()).to.deep.equal([ 'Eino', 'Eino', 'EiKoskessaHetuton' ])
        })
      })

      describe('Kun lisätään oppija', function() {
        before(addOppija.enterValidDataAmmatillinen())
        before(addOppija.submitAndExpectSuccess('EiKoskessaHetuton, Eino', 'Autoalan perustutkinto'))

        it('lisätty oppija näytetään', function() {})

        it('Lisätty opiskeluoikeus näytetään', function() {
          expect(opinnot.getTutkinto()).to.equal('Autoalan perustutkinto')
          expect(opinnot.getOppilaitos()).to.equal('Stadin ammattiopisto')
          expect(opinnot.getSuorituskieli()).to.equal('suomi')
        })
      })
    })

    describe('Validointi', function() {
      before(resetFixtures, prepareForNewOppija('kalle', '230872-7258'))

      describe('Aluksi', function() {
        it('Lisää-nappi on disabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(false)
        })
        it('Tutkinto-kenttä on disabloitu', function() {
          expect(addOppija.tutkintoIsEnabled()).to.equal(false)
        })
      })
      describe('Kun kutsumanimi löytyy väliviivallisesta nimestä', function() {
        before(
          addOppija.enterValidDataAmmatillinen({etunimet: 'Juha-Pekka', kutsumanimi: 'Pekka'})
        )
        it('Lisää-nappi on enabloitu', function() {
          expect(addOppija.isEnabled()).to.equal(true)
        })
      })
      describe('Aloituspäivä', function() {
        describe('Kun syötetään epäkelpo päivämäärä', function() {
          before(
            addOppija.enterValidDataAmmatillinen({etunimet: 'Juha-Pekka', kutsumanimi: 'Pekka'}),
            addOppija.selectAloituspäivä('38.1.2070')
          )
          it('Lisää-nappi on disabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(false)
          })
        })
        describe('Kun valitaan kelvollinen päivämäärä', function() {
          before(
            addOppija.enterValidDataAmmatillinen({etunimet: 'Juha-Pekka', kutsumanimi: 'Pekka'}),
            addOppija.selectAloituspäivä('1.1.2070')
          )
          it('Lisää-nappi on enabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(true)
          })
        })
      })
      describe('Tutkinto', function() {
        before(addOppija.enterValidDataAmmatillinen())
        describe('Aluksi', function() {
          it('Lisää-nappi enabloitu', function( ){
            expect(addOppija.isEnabled()).to.equal(true)
          })
        })
        describe('Kun tutkinto on virheellinen', function() {
          before(addOppija.enterTutkinto('virheellinen'))
          it('Lisää-nappi on disabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(false)
          })
        })
      })
      describe('Oppilaitosvalinta', function() {
        describe('Näytetään vain käyttäjän organisaatiopuuhun kuuluvat oppilaitokset', function() {
          describe('Kun vain 1 vaihtoehto', function() {
            before(
              prepareForNewOppija('omnia-palvelukäyttäjä', '230872-7258'),
              addOppija.enterHenkilötiedot(),
              addOppija.selectOpiskeluoikeudenTyyppi('Ammatillinen koulutus'),
              addOppija.selectTutkinto('auto'),
              addOppija.selectSuoritustapa('Ammatillinen perustutkinto')
            )
            it('Vaihtoehto on valmiiksi valittu', function() {
              expect(addOppija.oppilaitos()).to.deep.equal('Omnian ammattiopisto')
            })
            it('Lisää-nappi on enabloitu', function() {
              expect(addOppija.isEnabled()).to.equal(true)
            })
          })
          describe('Kun useampia vaihtoehtoja', function() {
            before(
              prepareForNewOppija('kalle', '230872-7258'),
              addOppija.enterValidDataAmmatillinen(),
              addOppija.enterOppilaitos('ammatti'),
              wait.forMilliseconds(500)
            )
            it('Mahdollistetaan valinta', function() {
              expect(addOppija.oppilaitokset()).to.deep.equal(['Lahden ammattikorkeakoulu', 'Omnian ammattiopisto', 'Stadin ammattiopisto'])
            })
          })
        })
        describe('Kun oppilaitosta ei olla valittu', function() {
          before(addOppija.enterData({oppilaitos: undefined}))
          it('Lisää-nappi on disabloitu', function() {
            expect(addOppija.isEnabled()).to.equal(false)
          })
          it('Tutkinnon valinta on estetty', function() {
            expect(addOppija.tutkintoIsEnabled()).to.equal(false)
          })
        })
        describe('Kun oppilaitos on valittu', function() {
          before(addOppija.enterValidDataAmmatillinen())
          it('voidaan valita tutkinto', function(){
            expect(addOppija.tutkintoIsEnabled()).to.equal(true)
            expect(addOppija.isEnabled()).to.equal(true)
          })
        })
        describe('Kun oppilaitos-valinta muutetaan', function() {
          before(addOppija.selectOppilaitos('Omnia'), addOppija.selectOpiskeluoikeudenTyyppi('Ammatillinen koulutus'))
          it('tutkinto pitää valita uudestaan', function() {
            expect(addOppija.isEnabled()).to.equal(false)
          })
          describe('Tutkinnon valinnan jälkeen', function() {
            before(addOppija.selectTutkinto('auto'), addOppija.selectSuoritustapa('Ammatillinen perustutkinto'))
            it('Lisää-nappi on enabloitu', function() {
              expect(addOppija.isEnabled()).to.equal(true)
            })
          })
        })
      })
      describe('Hetun validointi', function() {
        before(Authentication().login(), page.openPage)
        describe('Kun hetu on virheellinen', function() {
          before(
            page.oppijaHaku.search('123456-1234', page.oppijaHaku.isNoResultsLabelShown)
          )
          it('Lisää-nappi on disabloitu', function() {
            expect(page.oppijaHaku.canAddNewOppija()).to.equal(false)
          })
        })
        describe('Kun hetu sisältää väärän tarkistusmerkin', function() {
          before(
            page.oppijaHaku.search('011095-953Z', page.oppijaHaku.isNoResultsLabelShown)
          )
          it('Lisää-nappi on disabloitu', function() {
            expect(page.oppijaHaku.canAddNewOppija()).to.equal(false)
          })
        })
        describe('Kun hetu sisältää väärän päivämäärän, mutta on muuten validi', function() {
          before(
            page.oppijaHaku.search('300275-5557', page.oppijaHaku.isNoResultsLabelShown)
          )
          it('Lisää-nappi on disabloitu', function() {
            expect(page.oppijaHaku.canAddNewOppija()).to.equal(false)
          })
        })
      })
    })

    describe('Virhetilanteet', function() {
      describe('Kun sessio on vanhentunut', function() {
        before(
          resetFixtures,
          openPage('/koski/uusioppija#hetu=230872-7258', function() {return addOppija.isVisible()}),
          addOppija.enterValidDataAmmatillinen(),
          Authentication().logout,
          addOppija.submit)

        it('Siirrytään login-sivulle', wait.until(login.isVisible))
      })

      describe('Kun tallennus epäonnistuu', function() {
        before(
          Authentication().login(),
          openPage('/koski/uusioppija#hetu=230872-7258', function() {return addOppija.isVisible()}),
          addOppija.enterValidDataAmmatillinen({sukunimi: "error"}),
          addOppija.submit)

        it('Näytetään virheilmoitus', wait.until(page.isErrorShown))
      })
    })
  })

  describe('Opiskeluoikeuden mitätöiminen', function() {
    before(resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('280618-402H'), editor.edit)
    describe('Opiskeluoikeudelle jossa on valmiita suorituksia', function() {
      it('Ei ole mahdollista', function() {
        expect(opinnot.invalidateOpiskeluoikeusIsShown()).to.equal(false)
      })
    })

    describe('Opiskeluoikeudelle jossa ei ole valmiita suorituksia', function() {
      before(resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('010101-123N'), editor.edit)
      it('Näytetään mitätöintinappi', function() {
        expect(opinnot.invalidateOpiskeluoikeusIsShown()).to.equal(true)
      })

      describe('Painettaessa', function() {
        before(opinnot.invalidateOpiskeluoikeus)
        it('Pyydetään vahvistus', function() {
          expect(opinnot.confirmInvalidateOpiskeluoikeusIsShown()).to.equal(true)
        })

        describe('Painettaessa uudestaan', function() {
          before(opinnot.invalidateOpiskeluoikeus)
          it('Opiskeluoikeus mitätöidään', function() {
            expect(page.isOpiskeluoikeusInvalidated()).to.equal(true)
          })

          describe('Mitätöityä opiskeluoikeutta', function() {
            before(reloadTestFrame, wait.until(page.is404))
            it('Ei näytetä', function (){})
          })
        })
      })
    })
  })

  describe('Tietojen muuttaminen', function() {
    before(resetFixtures, page.openPage, addNewOppija('kalle', '280608-6619'))

    it('Aluksi ei näytetä \"Kaikki tiedot tallennettu\" -tekstiä', function() {
      expect(page.isSavedLabelShown()).to.equal(false)
    })

    describe('Järjestämismuodot', function() {
      var järjestämismuodot = editor.property('järjestämismuodot')
      before(
        editor.edit,
        järjestämismuodot.addItem,
        järjestämismuodot.propertyBySelector('.järjestämismuoto').setValue('Koulutuksen järjestäminen oppisopimuskoulutuksena'),
        järjestämismuodot.property('nimi').setValue('Virheellinen'),
        järjestämismuodot.property('yTunnus').setValue('123')
      )

      it('Aluksi näyttää y-tunnuksen esimerkin', function() {
        expect(järjestämismuodot.propertyBySelector('.yTunnus input').elem()[0].placeholder, 'Esimerkki: 1234567-8')
      })

      describe('Epävalidi y-tunnus', function() {
        before(järjestämismuodot.property('nimi').setValue('Virheellinen'), järjestämismuodot.property('yTunnus').setValue('123'))

        it('Ei anna tallentaa virheellistä y-tunnusta', function() {
          expect(opinnot.onTallennettavissa()).to.equal(false)
        })
      })

      describe('Validi y-tunnus', function() {
        before(
          editor.cancelChanges,
          editor.edit,
          järjestämismuodot.addItem,
          järjestämismuodot.propertyBySelector('.alku').setValue('22.8.2017'),
          järjestämismuodot.propertyBySelector('.järjestämismuoto').setValue('Koulutuksen järjestäminen oppisopimuskoulutuksena'),
          järjestämismuodot.property('nimi').setValue('Autohuolto oy'),
          järjestämismuodot.property('yTunnus').setValue('1629284-5'),
          editor.saveChanges,
          wait.until(page.isSavedLabelShown)
        )

        it('Toimii', function() {
          expect(page.isSavedLabelShown()).to.equal(true)
          expect(extractAsText(S('.järjestämismuodot'))).to.equal(
            'Järjestämismuodot 22.8.2017 — , Koulutuksen järjestäminen oppisopimuskoulutuksena\n' +
            'Yritys Autohuolto oy Y-tunnus 1629284-5'
          )
        })
      })
    })

    describe('Opiskeluoikeuden lisätiedot', function() {
      before(
        editor.edit,
        opinnot.expandAll,
        editor.property('hojks').addValue,
        editor.property('hojks').property('opetusryhmä').setValue('Erityisopetusryhmä'),
        editor.property('oikeusMaksuttomaanAsuntolapaikkaan').setValue(true),
        editor.property('ulkomaanjaksot').addItem,
        editor.property('ulkomaanjaksot').propertyBySelector('.alku').setValue('22.6.2017'),
        editor.property('ulkomaanjaksot').property('maa').setValue('Algeria'),
        editor.property('ulkomaanjaksot').property('kuvaus').setValue('Testing'),
        editor.property('majoitus').addItem,
        editor.property('majoitus').propertyBySelector('.alku').setValue('22.6.2017'),
        editor.property('majoitus').propertyBySelector('.loppu').setValue('1.1.2099'),
        editor.property('osaAikaisuus').setValue('50'),
        editor.property('poissaolojaksot').addItem,
        editor.property('poissaolojaksot').propertyBySelector('.alku').setValue('22.6.2017'),
        editor.property('poissaolojaksot').property('syy').setValue('Oma ilmoitus'),
        editor.saveChanges,
        wait.until(page.isSavedLabelShown)
      )

      it('Toimii', function() {
        expect(extractAsText(S('.lisätiedot'))).to.equal('Lisätiedot\n' +
          'Oikeus maksuttomaan asuntolapaikkaan kyllä\n' +
          'Majoitus 22.6.2017 — 1.1.2099\n' +
          'Ulkomaanjaksot 22.6.2017 — Maa Algeria Kuvaus Testing\n' +
          'Poissaolojaksot 22.6.2017 — Syy Oma ilmoitus\n' +
          'Hojks Opetusryhmä Erityisopetusryhmä\n' +
          'Osa-aikaisuus 50 %'
          )
      })
    })

    describe('Suorituksen lisääminen', function() {
      before(editor.edit)
      it('Päätason suoritusta ei voi lisätä ammatillisissa opinnoissa', function() {
        expect(opinnot.lisääSuoritusVisible()).to.equal(false)
      })
    })

    describe('Tutkinnon osat', function() {
      var suoritustapa = editor.property('suoritustapa')
      describe('Kun suoritustapa on opetussuunnitelman mukainen', function() {
        describe('Tutkinnon osan lisääminen', function() {
          before(
            editor.edit
          )
          describe('Aluksi', function () {
            it('Taulukko on tyhjä', function() {
              expect(opinnot.tutkinnonOsat('1').tyhjä()).to.equal(true)
            })
            it('Näytetään laajuussarake ja -yksikkö muokattaessa', function() {
              expect(opinnot.tutkinnonOsat().laajuudenOtsikko()).to.equal('Laajuus (osp)')
            })
          })
          describe('Pakollisen tutkinnon osan lisääminen', function() {
            before(
              editor.edit
            )

            describe('Ennen lisäystä', function() {
              it('Näyttää e-perusteiden mukaisen vaihtoehtolistan', function() {
                expect(opinnot.tutkinnonOsat('1').tutkinnonosavaihtoehdot().length).to.equal(47)
              })

              it('Näytetään pakollisten tutkinnon osien otsikkorivi', function() {
                expect(opinnot.tutkinnonOsat('1').isGroupHeaderVisible()).to.equal(true)
              })
            })

            describe('Lisäyksen jälkeen', function () {
              before(opinnot.tutkinnonOsat('1').lisääTutkinnonOsa('Huolto- ja korjaustyöt'))
              it('lisätty osa näytetään', function() {
                expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).nimi()).to.equal('Huolto- ja korjaustyöt')
              })
              describe('Arvosanan lisääminen', function() {
                before(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).propertyBySelector('.arvosana').setValue('3'))

                describe('Lisättäessä', function() {
                  it('Merkitsee tutkinnon osan tilaan VALMIS', function() {
                    expect(opinnot.tilaJaVahvistus.merkitseValmiiksiEnabled()).to.equal(true)
                  })
                })

                describe('Tallentamisen jälkeen', function() {
                  before(editor.saveChanges, wait.forAjax)

                  describe('Käyttöliittymän tila', function() {
                    it('näyttää edelleen oikeat tiedot', function() {
                      expect(opinnot.tutkinnonOsat().tutkinnonOsa(0).nimi()).to.equal('Huolto- ja korjaustyöt')
                    })
                  })

                  describe('Arvosanan poistaminen', function() {
                    before(
                      editor.edit,
                      opinnot.tutkinnonOsat('1').tutkinnonOsa(0).propertyBySelector('.arvosana').setValue('Ei valintaa'),
                      editor.saveChanges
                    )
                    it('Tallennus onnistuu ja suoritus siirtyy tilaan KESKEN', function() {
                      expect(opinnot.tutkinnonOsat().tutkinnonOsa(0).tila()).to.equal('Suoritus kesken')
                    })
                  })

                  describe('Laajuus', function() {
                    describe('Kun siirrytään muokkaamaan tietoja', function() {
                      before(editor.edit)
                      it('Laajuussarake ja laajuuden yksikkö näytetään', function() {
                        expect(opinnot.tutkinnonOsat().laajuudenOtsikko()).to.equal('Laajuus (osp)')
                      })

                      describe('Kun syötetään laajuus ja tallennetaan', function() {
                        before(
                          opinnot.tutkinnonOsat(1).tutkinnonOsa(0).property('laajuus').setValue('10'),
                          editor.saveChanges
                        )
                        it('Näytetään laajuus', function() {
                          expect(opinnot.tutkinnonOsat().laajuudenOtsikko()).to.equal('Laajuus (osp)')
                        })

                        describe('Kun poistetaan laajuus ja tallennetaan', function() {
                          before(
                            editor.edit,
                            opinnot.tutkinnonOsat(1).tutkinnonOsa(0).property('laajuus').setValue(''),
                            editor.saveChanges
                          )

                          it('Laajuussarake piilotetaan', function() {
                            expect(opinnot.tutkinnonOsat().laajuudenOtsikko()).to.equal('')
                          })
                        })
                      })
                    })

                  })

                  describe('Tutkinnon osan poistaminen', function() {
                    before(editor.edit, opinnot.tutkinnonOsat('1').tutkinnonOsa(0).poistaTutkinnonOsa, editor.saveChanges)
                    it('toimii', function() {
                      expect(opinnot.tutkinnonOsat().tyhjä()).to.equal(true)
                    })
                  })
                })
              })
            })
          })

          describe('Yhteisen tutkinnon osan lisääminen', function() {
            before(
              editor.edit
            )

            describe('Ennen lisäystä', function() {
              it('Näyttää e-perusteiden mukaisen vaihtoehtolistan', function() {
                expect(opinnot.tutkinnonOsat('2').tutkinnonosavaihtoehdot()).to.deep.equal([ '101054 Matemaattis-luonnontieteellinen osaaminen',
                  '101056 Sosiaalinen ja kulttuurinen osaaminen',
                  '101053 Viestintä- ja vuorovaikutusosaaminen',
                  '101055 Yhteiskunnassa ja työelämässä tarvittava osaaminen' ])
              })
            })

            describe('Lisäyksen jälkeen', function () {
              before(
                opinnot.tutkinnonOsat('2').lisääTutkinnonOsa('Matemaattis-luonnontieteellinen osaaminen')
              )
              it('lisätty osa näytetään', function() {
                expect(opinnot.tutkinnonOsat('2').tutkinnonOsa(0).nimi()).to.equal('Matemaattis-luonnontieteellinen osaaminen')
              })
            })
          })
          describe('Vapaavalintaisen tutkinnon osan lisääminen', function() {
            describe('Valtakunnallinen tutkinnon osa', function() {
              before(
                editor.edit,
                opinnot.tutkinnonOsat('3').lisääTutkinnonOsa('Huippuosaajana toimiminen')
              )

              describe('Lisäyksen jälkeen', function () {
                it('lisätty osa näytetään', function() {
                  expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Huippuosaajana toimiminen')
                })
              })

              describe('Tallennuksen jälkeen', function() {
                before(editor.saveChanges)
                it('lisätty osa näytetään', function() {
                  expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Huippuosaajana toimiminen')
                })
              })
            })

            describe('Paikallinen tutkinnon osa', function() {
              before(
                editor.edit,
                opinnot.tutkinnonOsat('3').tutkinnonOsa(0).poistaTutkinnonOsa,
                opinnot.tutkinnonOsat('3').lisääPaikallinenTutkinnonOsa('Hassut temput')
              )

              describe('Lisäyksen jälkeen', function () {
                it('lisätty osa näytetään', function() {
                  expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Hassut temput')
                })
              })

              describe('Tallennuksen jälkeen', function() {
                before(editor.saveChanges)
                it('lisätty osa näytetään', function() {
                  expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Hassut temput')
                })
              })
            })

            describe('Tutkinnon osa toisesta tutkinnosta', function() {
              describe('Kun valitaan sama tutkinto, kuin mitä ollaan suorittamassa', function() {
                before(
                  editor.edit,
                  opinnot.tutkinnonOsat('3').tutkinnonOsa(0).poistaTutkinnonOsa,
                  opinnot.tutkinnonOsat('3').lisääTutkinnonOsaToisestaTutkinnosta('Autoalan perustutkinto', 'Auton korjaaminen'),
                  editor.saveChanges
                )
                it('Lisäys onnistuu (siksi, että dataan ei tule tutkinto-kenttää)', function() {
                  expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Auton korjaaminen')
                })
              })
              describe('Kun valitaan toinen tutkinto', function() {
                before(
                  page.oppijaHaku.searchAndSelect('211097-402L'),
                  editor.edit,
                  opinnot.tutkinnonOsat('3').tutkinnonOsa(0).poistaTutkinnonOsa,
                  opinnot.tutkinnonOsat('3').lisääTutkinnonOsaToisestaTutkinnosta('Autoalan perustutkinto', 'Auton korjaaminen')
                )

                describe('Lisäyksen jälkeen', function () {
                  it('lisätty osa näytetään', function() {
                    expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Auton korjaaminen')
                  })
                })

                describe('Tallennuksen jälkeen', function() {
                  before(editor.saveChanges)
                  it('lisätty osa näytetään', function() {
                    expect(opinnot.tutkinnonOsat('3').tutkinnonOsa(0).nimi()).to.equal('Auton korjaaminen')
                  })
                })
              })
            })
          })
        })
      })

      describe('Osaamisen tunnustamisen muokkaus', function() {
        var tunnustaminen = opinnot.tutkinnonOsat('1').tutkinnonOsa(0).property('tunnustettu')

        before(
          page.oppijaHaku.searchAndSelect('280608-6619'),
          editor.edit,
          opinnot.tutkinnonOsat('1').lisääTutkinnonOsa('Huolto- ja korjaustyöt')
        )

        describe('Alussa', function() {
          it('Ei osaamisen tunnustamistietoa, lisäysmahdollisuus', function() {
            expect(tunnustaminen.getValue()).to.equal('Lisää ammattiosaamisen tunnustaminen')
          })
        })

        describe('Lisääminen', function()  {
          before(
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).lisääOsaamisenTunnustaminen,
            tunnustaminen.setValue('Tunnustamisen esimerkkiselite'),
            editor.saveChanges,
            opinnot.expandAll
          )

          describe('Tallennuksen jälkeen', function() {
            it('Osaamisen tunnustamisen selite näytetään', function() {
              expect(tunnustaminen.getValue()).to.equal('Tunnustamisen esimerkkiselite')
            })
          })

          describe('Muokkaus', function()  {
            before(
              editor.edit,
              opinnot.expandAll,
              tunnustaminen.setValue('Tunnustamisen muokattu esimerkkiselite')
            )
            it('toimii', function() {
              expect(tunnustaminen.getValue()).to.equal('Tunnustamisen muokattu esimerkkiselite')
            })
          })

          describe('Poistaminen', function()  {
            before(
              editor.edit,
              opinnot.expandAll,
              opinnot.tutkinnonOsat('1').tutkinnonOsa(0).poistaOsaamisenTunnustaminen,
              editor.saveChanges,
              editor.edit,
              opinnot.expandAll
            )
            it('toimii', function() {
              expect(tunnustaminen.getValue()).to.equal('Lisää ammattiosaamisen tunnustaminen')
            })
          })
        })

      })

      describe('Näytön muokkaus', function() {
        before(
          editor.edit,
          opinnot.tutkinnonOsat('1').tutkinnonOsa(0).poistaTutkinnonOsa,
          opinnot.tutkinnonOsat('1').lisääTutkinnonOsa('Huolto- ja korjaustyöt')
        )

        describe('Alussa', function() {
          it('ei näyttöä', function() {
            expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().getValue()).to.equal('Lisää ammattiosaamisen näyttö')
          })
        })

        describe('Lisääminen', function()  {
          before(
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).avaaNäyttöModal,
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).asetaNäytönTiedot({
              kuvaus: 'Näytön esimerkkikuvaus',
              suorituspaikka: ['työpaikka', 'Esimerkkityöpaikka, Esimerkkisijainti'],
              työssäoppimisenYhteydessä: false,
              arvosana: '3',
              arvioinnistaPäättäneet: ['Opettaja'],
              arviointikeskusteluunOsallistuneet: ['Opettaja', 'Opiskelija'],
              arviointipäivä: '1.2.2017'
            }),
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).painaOkNäyttöModal
          )
          it('toimii', function() {
            expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().property('arvosana').getValue()).to.equal('3')
            expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().property('kuvaus').getValue()).to.equal('Näytön esimerkkikuvaus')
          })
        })

        describe('Muokkaus', function()  {
          before(
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).avaaNäyttöModal,
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).asetaNäytönTiedot({
              kuvaus: 'Näytön muokattu esimerkkikuvaus',
              suorituspaikka: ['työpaikka', 'Esimerkkityöpaikka, Esimerkkisijainti'],
              työssäoppimisenYhteydessä: true,
              arvosana: '2',
              arvioinnistaPäättäneet: ['Opettaja'],
              arviointikeskusteluunOsallistuneet: ['Opettaja', 'Opiskelija'],
              arviointipäivä: '1.2.2017'
            }),
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).painaOkNäyttöModal
          )
          describe('Näyttää oikeat tiedot', function() {
            it('toimii', function() {
              expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().property('arvosana').getValue()).to.equal('2')
              expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().property('kuvaus').getValue()).to.equal('Näytön muokattu esimerkkikuvaus')
            })
          })
          describe('Oikeat tiedot säilyvät modalissa', function() {
            before(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).avaaNäyttöModal)
            it('toimii', function() {
              var näyttö = opinnot.tutkinnonOsat('1').tutkinnonOsa(0).lueNäyttöModal()
              expect(näyttö.kuvaus).to.equal('Näytön muokattu esimerkkikuvaus')
              expect(näyttö.suorituspaikka).to.deep.equal(['työpaikka', 'Esimerkkityöpaikka, Esimerkkisijainti'])
              expect(näyttö.työssäoppimisenYhteydessä).to.equal(true)
              expect(näyttö.arvosana).to.equal('2')
              expect(näyttö.arvioinnistaPäättäneet).to.deep.equal(['Opettaja'])
              expect(näyttö.arviointikeskusteluunOsallistuneet).to.deep.equal(['Opettaja', 'Opiskelija'])
              expect(näyttö.arviointipäivä).to.equal('1.2.2017')
            })
            after(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).painaOkNäyttöModal)
          })
        })

        describe('Tallentamisen jälkeen', function() {
          before(editor.saveChanges, editor.edit, opinnot.expandAll)
          it('näyttää edelleen oikeat tiedot', function() {
            expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().property('kuvaus').getValue()).to.equal('Näytön muokattu esimerkkikuvaus')
          })
        })

        describe('Poistaminen', function() {
          before(
            opinnot.tutkinnonOsat('1').tutkinnonOsa(0).poistaNäyttö
          )
          it('toimii', function() {
            expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().getValue()).to.equal('Lisää ammattiosaamisen näyttö')
          })
        })

        describe('Tallentamisen jälkeen', function() {
          before(editor.saveChanges, editor.edit, opinnot.expandAll)
          it('näyttää edelleen oikeat tiedot', function() {
            expect(opinnot.tutkinnonOsat('1').tutkinnonOsa(0).näyttö().getValue()).to.equal('Lisää ammattiosaamisen näyttö')
          })
        })
      })

      describe('Kun suoritustapana on näyttö', function() {
        before(
          resetFixtures,
          page.openPage,
          addNewOppija('kalle', '280608-6619', { suoritustapa: 'Näyttö'} ),
          editor.edit
        )

        it('Tutkinnon osia ei ryhmitellä', function() {
          expect(opinnot.tutkinnonOsat('1').isGroupHeaderVisible()).to.equal(false)
        })

        describe('Tutkinnon osan lisääminen', function() {
          before(
            opinnot.tutkinnonOsat().lisääTutkinnonOsa('Huolto- ja korjaustyöt'),
            editor.saveChanges
          )
          it('toimii', function() {
          })

          describe('Tutkinnon osan poistaminen', function() {
            before(editor.edit, opinnot.tutkinnonOsat().tutkinnonOsa(0).poistaTutkinnonOsa, editor.saveChanges)
            it('toimii', function() {
              expect(opinnot.tutkinnonOsat().tyhjä()).to.equal(true)
            })
          })
        })
      })
    })
  })

  describe('Ammatillinen perustutkinto', function() {
    before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('280618-402H'))
    describe('Suoritus valmis, kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)
      describe('Tietojen näyttäminen', function() {

        it('näyttää ammatillisenopiskeluoikeudentyypin tiedot', function() {
          expect(extractAsText(S('.ammatillinenkoulutus'))).to.equal(
              'Ammatillinen koulutus\n' +
              'Stadin ammattiopisto\n' +
              'Ammatillinen tutkinto 2012 - 2016 , Valmistunut')
        })
        it('näyttää opiskeluoikeuden otsikkotiedot', function() {
          expect(opinnot.opiskeluoikeudet.opiskeluoikeuksienOtsikot()).to.deep.equal(['Stadin ammattiopisto,Luonto- ja ympäristöalan perustutkinto(2012-2016,valmistunut)'])
        })
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Opiskeluoikeuden voimassaoloaika : 1.9.2012 — 31.5.2016\n' +
            'Tila 31.5.2016 Valmistunut\n' +
            '1.9.2012 Läsnä')
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equalIgnoreNewlines(
            'Koulutus Luonto- ja ympäristöalan perustutkinto 62/011/2014\n' +
            'Suoritustapa Ammatillinen perustutkinto\n' +
            'Tutkintonimike Ympäristönhoitaja\nOsaamisala Ympäristöalan osaamisala\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Suorituskieli suomi\n' +
            'Järjestämismuodot 1.9.2013 — , Koulutuksen järjestäminen lähiopetuksena, etäopetuksena tai työpaikalla\n' +
            'Työssäoppimisjaksot 1.1.2014 — 15.3.2014 Jyväskylä , Suomi\n' +
            'Työssäoppimispaikka Sortti-asema\n' +
            'Työtehtävät Toimi harjoittelijana Sortti-asemalla\n' +
            'Laajuus 5 osp\n' +
            'Ryhmä YMP14SN\n' +
            'Suoritus valmis Vahvistus : 31.5.2016 Helsinki Reijo Reksi , rehtori')
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.ammatillisentutkinnonsuoritus > .osasuoritukset'))).to.equal('Sulje kaikki\n' +
            'Ammatilliset tutkinnon osat Pakollisuus Laajuus (osp) Arvosana\n' +
            'Kestävällä tavalla toimiminen kyllä 40 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Ympäristön hoitaminen kyllä 35 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Näyttö\n' +
            'Kuvaus Muksulan päiväkodin ympäristövaikutusten arvioiminen ja ympäristön kunnostustöiden tekeminen sekä mittauksien tekeminen ja näytteiden ottaminen\n' +
            'Suorituspaikka Muksulan päiväkoti, Kaarinan kunta\n' +
            'Suoritusaika 1.2.2016 — 1.2.2016\n' +
            'Työssäoppimisen yhteydessä ei\n' +
            'Arvosana 3\n' +
            'Arviointipäivä 20.10.2014\n' +
            'Arvioitsijat Jaana Arstila ( näyttötutkintomestari ) Pekka Saurmann ( näyttötutkintomestari ) Juhani Mykkänen\n' +
            'Arviointikohteet Arviointikohde Arvosana\n' +
            'Työprosessin hallinta 3\n' +
            'Työmenetelmien, -välineiden ja materiaalin hallinta 2\n' +
            'Työn perustana olevan tiedon hallinta 2\n' +
            'Elinikäisen oppimisen avaintaidot 3\n' +
            'Arvioinnista päättäneet Opettaja\n' +
            'Arviointikeskusteluun osallistuneet Opettaja Itsenäinen ammatinharjoittaja\n' +
            'Uusiutuvien energialähteiden hyödyntäminen kyllä 15 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Ulkoilureittien rakentaminen ja hoitaminen kyllä 15 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Kulttuuriympäristöjen kunnostaminen ja hoitaminen kyllä 15 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Näyttö\n' +
            'Kuvaus Sastamalan kunnan kulttuuriympäristöohjelmaan liittyvän Wanhan myllyn lähiympäristön kasvillisuuden kartoittamisen sekä ennallistamisen suunnittelu ja toteutus\n' +
            'Suorituspaikka Sastamalan kunta\n' +
            'Suoritusaika 1.3.2016 — 1.3.2016\n' +
            'Työssäoppimisen yhteydessä ei\n' +
            'Arvosana 3\n' +
            'Arviointipäivä 20.10.2014\n' +
            'Arvioitsijat Jaana Arstila ( näyttötutkintomestari ) Pekka Saurmann ( näyttötutkintomestari ) Juhani Mykkänen\n' +
            'Arviointikohteet Arviointikohde Arvosana\n' +
            'Työprosessin hallinta 3\n' +
            'Työmenetelmien, -välineiden ja materiaalin hallinta 2\n' +
            'Työn perustana olevan tiedon hallinta 2\n' +
            'Elinikäisen oppimisen avaintaidot 3\n' +
            'Arvioinnista päättäneet Opettaja\n' +
            'Arviointikeskusteluun osallistuneet Opettaja Itsenäinen ammatinharjoittaja\n' +
            'Vesistöjen kunnostaminen ja hoitaminen kyllä 15 Hyväksytty\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Lisätiedot Muutos arviointiasteikossa\n' +
            'Tutkinnon osa on koulutuksen järjestäjän päätöksellä arvioitu asteikolla hyväksytty/hylätty.\n' +
            'Näyttö\n' +
            'Kuvaus Uimarin järven tilan arviointi ja kunnostus\n' +
            'Suorituspaikka Vesipojat Oy\n' +
            'Suoritusaika 1.4.2016 — 1.4.2016\n' +
            'Työssäoppimisen yhteydessä ei\n' +
            'Arvosana 3\n' +
            'Arviointipäivä 20.10.2014\n' +
            'Arvioitsijat Jaana Arstila ( näyttötutkintomestari ) Pekka Saurmann ( näyttötutkintomestari ) Juhani Mykkänen\n' +
            'Arviointikohteet Arviointikohde Arvosana\n' +
            'Työprosessin hallinta 3\n' +
            'Työmenetelmien, -välineiden ja materiaalin hallinta 2\n' +
            'Työn perustana olevan tiedon hallinta 2\n' +
            'Elinikäisen oppimisen avaintaidot 3\n' +
            'Arvioinnista päättäneet Opettaja\n' +
            'Arviointikeskusteluun osallistuneet Opettaja Itsenäinen ammatinharjoittaja\n' +
            'Sulje kaikki\n' +
            'Kokonaisuus Arvosana\n' +
            'Hoitotarpeen määrittäminen Hyväksytty\n' +
            'Kuvaus Hoitotarpeen määrittäminen\n' +
            'Yhteensä 135 / 135 osp\n' +
            'Yhteiset tutkinnon osat Pakollisuus Laajuus (osp) Arvosana\n' +
            'Viestintä- ja vuorovaikutusosaaminen kyllä 11 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Osa-alue Pakollisuus Laajuus (osp) Arvosana\n' +
            'Äidinkieli, Suomen kieli ja kirjallisuus kyllä 5 3\n' +
            'Äidinkieli, Suomen kieli ja kirjallisuus ei 3 3\n' +
            'Toinen kotimainen kieli, ruotsi kyllä 1 3\n' +
            'Vieraat kielet, englanti kyllä 2 3\n' +
            'Matemaattis-luonnontieteellinen osaaminen kyllä 9 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Lisätiedot Arvioinnin mukauttaminen\n' +
            'Tutkinnon osan ammattitaitovaatimuksia tai osaamistavoitteita ja osaamisen arviointia on mukautettu ammatillisesta peruskoulutuksesta annetun lain (630/1998, muutos 246/2015) 19 a tai 21 §:n perusteella\n' +
            'Sulje kaikki\n' +
            'Osa-alue Pakollisuus Laajuus (osp) Arvosana\n' +
            'Matematiikka kyllä 3 3\n' +
            'Kuvaus Matematiikan opinnot\n' +
            'Fysiikka ja kemia kyllä 3 3\n' +
            'Tieto- ja viestintätekniikka sekä sen hyödyntäminen kyllä 3 3\n' +
            'Alkamispäivä 1.1.2014\n' +
            'Tunnustettu\n' +
            'Tutkinnon osa Asennushitsaus\n' +
            'Selite Tutkinnon osa on tunnustettu Kone- ja metallialan perustutkinnosta\n' +
            'Lisätiedot Arvioinnin mukauttaminen\n' +
            'Tutkinnon osan ammattitaitovaatimuksia tai osaamistavoitteita ja osaamisen arviointia on mukautettu ammatillisesta peruskoulutuksesta annetun lain (630/1998, muutos 246/2015) 19 a tai 21 §:n perusteella\n' +
            'Yhteiskunnassa ja työelämässä tarvittava osaaminen kyllä 8 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Sosiaalinen ja kulttuurinen osaaminen kyllä 7 3\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Yhteensä 35 / 35 osp\n' +
            'Vapaasti valittavat tutkinnon osat Pakollisuus Laajuus (osp) Arvosana\n' +
            'Sosiaalinen ja kulttuurinen osaaminen ei 5 3\n' +
            'Kuvaus Sosiaalinen ja kulttuurinen osaaminen\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Yhteensä 5 / 10 osp\n' +
            'Tutkintoa yksilöllisesti laajentavat tutkinnon osat Pakollisuus Laajuus (osp) Arvosana\n' +
            'Matkailuenglanti ei 5 3\n' +
            'Kuvaus Matkailuenglanti\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Yhteensä 5 osp')
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus(0))
        it('näytetään', function() {
          expect(TodistusPage().headings()).to.equal('HELSINGIN KAUPUNKIStadin ammattiopistoPäättötodistusLuonto- ja ympäristöalan perustutkintoYmpäristöalan osaamisala, Ympäristönhoitaja Ammattilainen, Aarne (280618-402H)')
          expect(TodistusPage().arvosanarivi('.tutkinnon-osa.100431')).to.equal('Kestävällä tavalla toimiminen 40 Kiitettävä 3')
          expect(TodistusPage().arvosanarivi('.opintojen-laajuus')).to.equal('Opiskelijan suorittamien tutkinnon osien laajuus osaamispisteinä 180')
          expect(TodistusPage().vahvistus()).to.equal('Helsinki 31.5.2016 Reijo Reksi rehtori')
        })
      })
    })

    describe('Suoritus kesken, vanhan perusteen suoritus tunnustettu', function () {
      before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('140176-449X'), opinnot.expandAll)
      it('näyttää opiskeluoikeuden tiedot', function () {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Opiskeluoikeuden voimassaoloaika : 1.9.2016 — 1.5.2020 (arvioitu)\n' +
          'Tila 1.9.2016 Läsnä'
        )
      })

      it('näyttää suorituksen tiedot', function () {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Autoalan perustutkinto 39/011/2014\n' +
          'Suoritustapa Näyttötutkinto\n' +
          'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Alkamispäivä 1.9.2016\n' +
          'Suorituskieli suomi\n' +
          'Suoritus kesken'
        )
      })

      it('näyttää tutkinnon osat', function () {
        expect(extractAsText(S('.osasuoritukset'))).to.equalIgnoreNewlines(
          'Sulje kaikki\n' +
          'Tutkinnon osa Pakollisuus Laajuus (osp) Arvosana\n' +
          'Moottorin ja voimansiirron huolto ja korjaus ei 15 Hyväksytty\n' +
          'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Vahvistus 31.5.2013 Reijo Reksi , rehtori\n' +
          'Tunnustettu\n' +
          'Tutkinnon osa Tunniste 11-22-33\n' +
          'Nimi Moottorin korjaus\n' +
          'Kuvaus Opiskelijan on - tunnettava jakopyörästön merkitys moottorin toiminnalle - osattava kytkeä moottorin testauslaite ja tulkita mittaustuloksen suhdetta valmistajan antamiin ohjearvoihin - osattava käyttää moottorikorjauksessa tarvittavia perustyökaluja - osattava suorittaa jakopään hammashihnan vaihto annettujen ohjeiden mukaisesti - tunnettava venttiilikoneiston merkitys moottorin toiminnan osana osatakseen mm. ottaa se huomioon jakopään huoltoja tehdessään - noudatettava sovittuja työaikoja\n' +
          'Vahvistus 28.5.2002 Reijo Reksi\n' +
          'Näyttö\n' +
          'Kuvaus Moottorin korjaus\n' +
          'Suorituspaikka Autokorjaamo Oy, Riihimäki\n' +
          'Suoritusaika 20.4.2002 — 20.4.2002\n' +
          'Työssäoppimisen yhteydessä ei\n' +
          'Selite Tutkinnon osa on tunnustettu aiemmin suoritetusta autoalan perustutkinnon osasta (1.8.2000 nro 11/011/2000)\n' +
          'Yhteensä 15 osp'
        )
      })
    })

    describe('Opiskeluoikeuden lisätiedot', function() {
      before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('211097-402L'), opinnot.expandAll)

      it('näytetään', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot > .lisätiedot'))).to.equal('Lisätiedot\n' +
          'Oikeus maksuttomaan asuntolapaikkaan kyllä\n' +
          'Majoitus 1.9.2012 — 1.9.2013\n' +
          'Sisäoppilaitosmainen majoitus 1.9.2012 — 1.9.2013\n' +
          'Vaativan erityisen tuen yhteydessä järjestettävä majoitus 1.9.2012 — 1.9.2013\n' +
          'Ulkomaanjaksot 1.9.2012 — 1.9.2013 Maa Ruotsi Kuvaus Harjoittelua ulkomailla\n' +
          'Poissaolojaksot 1.10.2013 — 31.10.2013 Syy Oma ilmoitus\n' +
          'Hojks Opetusryhmä Yleinen opetusryhmä\n' +
          'Vaikeasti vammainen kyllä\n' +
          'Vammainen ja avustaja kyllä\n' +
          'Osa-aikaisuus 80 %\n' +
          'Henkilöstökoulutus kyllä\n' +
          'Vankilaopetuksessa kyllä')
      })
    })

  })

  describe('Osittainen ammatillinen tutkinto', function() {
    before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('230297-6448'))
    describe('Kaikki tiedot näkyvissä', function() {
      before(opinnot.expandAll)

      it('näyttää opiskeluoikeuden otsikkotiedot', function() {
        expect(opinnot.opiskeluoikeudet.opiskeluoikeuksienOtsikot()).to.deep.equal(['Stadin ammattiopisto,Luonto- ja ympäristöalan perustutkinto, osittainen(2012-2016,valmistunut)'])
        expect(extractAsText(S('.suoritus-tabs .selected'))).to.equal('Luonto- ja ympäristöalan perustutkinto, osittainen')
      })

      it('näyttää opiskeluoikeuden tiedot', function() {
        expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
          'Opiskeluoikeuden voimassaoloaika : 1.9.2012 — 31.5.2016\n' +
          'Tila 31.5.2016 Valmistunut\n' +
          '1.9.2012 Läsnä'
        )
      })

      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Luonto- ja ympäristöalan perustutkinto 62/011/2014\n' +
          'Tutkintonimike Autokorinkorjaaja\n' +
          'Toinen tutkintonimike kyllä\n' +
          'Osaamisala Autokorinkorjauksen osaamisala\n' +
          'Toinen osaamisala kyllä\n' +
          'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Suorituskieli suomi\n' +
          'Järjestämismuodot 1.9.2012 — , Koulutuksen järjestäminen lähiopetuksena, etäopetuksena tai työpaikalla\n' +
          'Todistuksella näkyvät lisätiedot Suorittaa toista osaamisalaa\n' +
          'Suoritus valmis Vahvistus : 4.6.2016 Reijo Reksi , rehtori'
        )
      })

      it('näyttää tutkinnon osat', function() {
        expect(extractAsText(S('.osasuoritukset'))).to.equalIgnoreNewlines(
          'Sulje kaikki Tutkinnon osa Pakollisuus Laajuus (osp) Arvosana\n' +
          'Ympäristön hoitaminen kyllä 35 3\n' +
          'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
          'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
          'Yhteensä 35 osp'
        )
      })
    })
  })

  describe('Näyttötutkinnot', function() {
    before(Authentication().login(), resetFixtures, page.openPage, page.oppijaHaku.searchAndSelect('250989-419V'), OpinnotPage().valitseSuoritus(1, 'Näyttötutkintoon valmistava koulutus'))
    describe('Näyttötutkintoon valmistava koulutus', function() {
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Opiskeluoikeuden voimassaoloaika : 1.9.2012 — 31.5.2016\n' +
            'Tila 31.5.2016 Valmistunut\n' +
            '1.9.2012 Läsnä'
          )
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Näyttötutkintoon valmistava koulutus\n' +
            'Tutkinto Autoalan työnjohdon erikoisammattitutkinto 40/011/2001\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Alkamispäivä 1.9.2012\n' +
            'Suorituskieli suomi\n' +
            'Suoritus valmis Vahvistus : 31.5.2015 Helsinki Reijo Reksi , rehtori'
          )
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.osasuoritukset'))).to.equalIgnoreNewlines(
            'Sulje kaikki Koulutuksen osa Pakollisuus Laajuus Arvosana\n' +
            'Johtaminen ja henkilöstön kehittäminen Hyväksytty\n' +
            'Kuvaus Johtamisen ja henkilöstön kehittämisen valmistava koulutus\n' +
            'Auton lisävarustetyöt ei 15 osp Hyväksytty\n' +
            'Yhteensä 15'
          )
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus(0))
        it('näytetään', function() {
          expect(TodistusPage().vahvistus()).to.equal('Helsinki 31.5.2015 Reijo Reksi rehtori')
        })
      })
    })

    describe('Erikoisammattitutkinto', function() {
      before(TodistusPage().close, wait.until(page.isOppijaSelected('Erja')), OpinnotPage().valitseSuoritus(1, 'Autoalan työnjohdon erikoisammattitutkinto'))
      describe('Kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Opiskeluoikeuden voimassaoloaika : 1.9.2012 — 31.5.2016\n' +
            'Tila 31.5.2016 Valmistunut\n' +
            '1.9.2012 Läsnä'
          )
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Autoalan työnjohdon erikoisammattitutkinto 40/011/2001\n' +
            'Suoritustapa Näyttötutkinto\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Suorituskieli suomi\n' +
            'Järjestämismuodot 1.8.2014 — , Koulutuksen järjestäminen lähiopetuksena, etäopetuksena tai työpaikalla\n' +
            '31.5.2015 — , Koulutuksen järjestäminen oppisopimuskoulutuksena\n' +
            'Yritys Autokorjaamo Oy Y-tunnus 1234567-8\n' +
            '31.3.2016 — , Koulutuksen järjestäminen lähiopetuksena, etäopetuksena tai työpaikalla\n' +
            'Suoritus valmis Vahvistus : 31.5.2016 Helsinki Reijo Reksi , rehtori'
          )
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.osasuoritukset'))).to.equalIgnoreNewlines(
            'Sulje kaikki Tutkinnon osa Pakollisuus Arvosana\n' +
            'Johtaminen ja henkilöstön kehittäminen kyllä Hyväksytty\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Asiakaspalvelu ja korjaamopalvelujen markkinointi kyllä Hyväksytty\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Työnsuunnittelu ja organisointi kyllä Hyväksytty\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Taloudellinen toiminta kyllä Hyväksytty\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Yrittäjyys kyllä Hyväksytty\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 31.5.2016 Reijo Reksi , rehtori\n' +
            'Yhteensä 0 osp'
          )
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus())
        it('näytetään', function() {
          expect(TodistusPage().vahvistus()).to.equal('Helsinki 31.5.2016 Reijo Reksi rehtori')
        })
      })

      describe('Tutkinnon osat', function() {
        before(TodistusPage().close, editor.edit)
        it('Tutkinnon osia ei ryhmitellä', function() {
          expect(opinnot.tutkinnonOsat('1').isGroupHeaderVisible()).to.equal(false)
        })

        before(
          opinnot.tutkinnonOsat().lisääTutkinnonOsa('Tekniikan asiantuntemus')
        )

        describe('Lisäyksen jälkeen', function () {
          it('lisätty osa näytetään', function() {
            expect(opinnot.tutkinnonOsat().tutkinnonOsa(5).nimi()).to.equal('Tekniikan asiantuntemus')
          })
          describe('kun tallennetaan', function() {
            before(opinnot.tutkinnonOsat().tutkinnonOsa(5).propertyBySelector('.arvosana').setValue('3'), editor.saveChanges)
            it('tallennus onnistuu', function() {
              expect(page.isSavedLabelShown()).to.equal(true)
            })
          })
        })
      })
    })

    describe('Uusi erikoisammattitutkinto', function() {
      before(
        page.openPage,
        addNewOppija('kalle', '250858-5188', {  oppilaitos: 'Stadin', tutkinto: 'Autoalan työnjohdon erikoisammattitutkinto', suoritustapa: ''})
      )
      describe('Uuden tutkinnonosan lisääminen', function() {
        before(
            editor.edit,
            opinnot.tutkinnonOsat().lisääTutkinnonOsa('Tekniikan asiantuntemus'),
            opinnot.tutkinnonOsat().tutkinnonOsa(0).propertyBySelector('.arvosana').setValue('3'),
            editor.saveChanges,
            wait.until(page.isSavedLabelShown)
        )
        it('onnistuu', function() {
          expect(extractAsText(S('.osasuoritukset'))).to.equalIgnoreNewlines(
              'Tutkinnon osa Pakollisuus Arvosana\n' +
              'Tekniikan asiantuntemus ei 3\n' +
              'Yhteensä 0 osp'
          )
        })
      })
    })
  })

  describe('Luottamuksellinen data', function() {
    before(page.openPage, page.oppijaHaku.searchAndSelect('010101-123N'), opinnot.expandAll)
    describe('Kun käyttäjällä on luottamuksellinen rooli', function() {
      it('näkyy', function() {
        expect(extractAsText(S('.lisätiedot'))).to.equal(
         'Lisätiedot\n' +
          'Vankilaopetuksessa kyllä'
        )
      })
    })

    describe('Kun käyttäjällä ei ole luottamuksellinen roolia', function() {
      before(Authentication().logout, Authentication().login('stadin-vastuu'), page.openPage, page.oppijaHaku.searchAndSelect('010101-123N'), opinnot.expandAll)
      it('piilotettu', function() {
        expect(extractAsText(S('.lisätiedot'))).to.equal('Lisätiedot')
      })
    })
  })

  describe('Ammatilliseen peruskoulutukseen valmentava koulutus VALMA', function() {
    describe('Oppilaitos katselija käyttöoikeuksilla', function() {
      before(Authentication().logout, Authentication().login('katselija'), page.openPage, page.oppijaHaku.searchAndSelect('130404-054C'))
      describe('kaikki tiedot näkyvissä', function() {
        before(opinnot.expandAll)
        it('näyttää opiskeluoikeuden tiedot', function() {
          expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
            'Opiskeluoikeuden voimassaoloaika : 14.9.2009 — 4.6.2016\n' +
            'Tila 4.6.2016 Valmistunut\n' +
            '14.9.2009 Läsnä'
          )
        })

        it('näyttää suorituksen tiedot', function() {
          expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
            'Koulutus Ammatilliseen peruskoulutukseen valmentava koulutus (VALMA) 5/011/2015\n' +
            'Laajuus 65 osp\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto\n' +
            'Suorituskieli suomi\n' +
            'Suoritus valmis Vahvistus : 4.6.2016 Reijo Reksi , rehtori'
          )
        })

        it('näyttää tutkinnon osat', function() {
          expect(extractAsText(S('.osasuoritukset'))).to.equalIgnoreNewlines(
            'Sulje kaikki Koulutuksen osa Pakollisuus Laajuus (osp) Arvosana\n' +
            'Ammatilliseen koulutukseen orientoituminen ja työelämän perusvalmiuksien hankkiminen kyllä 10 osp Hyväksytty\n' +
            'Kuvaus Ammatilliseen koulutukseen orientoituminen ja työelämän perusvalmiuksien hankkiminen\n' +
            'Opiskeluvalmiuksien vahvistaminen ei 10 osp Hyväksytty\n' +
            'Kuvaus Opiskeluvalmiuksien vahvistaminen\n' +
            'Työssäoppimiseen ja oppisopimuskoulutukseen valmentautuminen ei 15 osp Hyväksytty\n' +
            'Kuvaus Työssäoppimiseen ja oppisopimuskoulutukseen valmentautuminen\n' +
            'Arjen taitojen ja hyvinvoinnin vahvistaminen ei 10 osp Hyväksytty\n' +
            'Kuvaus Arjen taitojen ja hyvinvoinnin vahvistaminen\n' +
            'Tietokoneen käyttäjän AB-kortti ei 5 osp Hyväksytty\n' +
            'Kuvaus Tietokoneen käyttäjän AB-kortti\n' +
            'Auton lisävarustetyöt ei 15 osp Hyväksytty\n' +
            'Tunnustettu\n' +
            'Tutkinnon osa Asennuksen ja automaation perustyöt\n' +
            'Tutkinto Kone- ja metallialan perustutkinto 39/011/2014\n' +
            'Oppilaitos / toimipiste Stadin ammattiopisto, Lehtikuusentien toimipaikka\n' +
            'Vahvistus 3.10.2015 Helsinki Reijo Reksi , rehtori\n' +
            'Selite Tutkinnon osa on tunnustettu Kone- ja metallialan perustutkinnosta\n' +
            'Yhteensä 65 osp'
          )
        })
      })

      describe('Tulostettava todistus', function() {
        before(OpinnotPage().avaaTodistus(0))
        it('näytetään', function() {
          // See more detailed content specification in ValmaSpec.scala
          expect(TodistusPage().vahvistus()).to.equal('4.6.2016 Reijo Reksi rehtori')
        })
      })
    })
  })
})
