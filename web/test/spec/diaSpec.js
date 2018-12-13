describe('DIA', function( ) {
  var page = KoskiPage()
  var todistus = TodistusPage()
  var opinnot = OpinnotPage()
  var editor = opinnot.opiskeluoikeusEditor()
  var opiskeluoikeus = OpiskeluoikeusDialog()
  var addOppija = AddOppijaPage()
  before(Authentication().login(), resetFixtures)

  describe('Opiskeluoikeuden tiedot', function () {
    before(page.openPage, page.oppijaHaku.searchAndSelect('151013-2195'))
    it('näytetään oikein', function() {
      expect(extractAsText(S('.opiskeluoikeuden-tiedot'))).to.equal(
        'Opiskeluoikeuden voimassaoloaika : 1.9.2012 — 4.6.2016\n' +
        'Tila 4.6.2016 Valmistunut\n' +
        '1.9.2012 Läsnä')
    })

    describe('Opiskeluoikeuden lisätiedot', function() {
      describe('Lisätietojen lisäys', function() {
        before(
          editor.edit,
          opinnot.expandAll,
          editor.property('pidennettyPäättymispäivä').setValue(true),
          editor.property('ulkomainenVaihtoopiskelija').setValue(true),
          editor.property('ulkomaanjaksot').addItem,
          editor.property('ulkomaanjaksot').propertyBySelector('.alku').setValue('4.1.2013'),
          editor.property('ulkomaanjaksot').propertyBySelector('.loppu').setValue('16.3.2013'),
          editor.property('ulkomaanjaksot').property('maa').setValue('Ahvenanmaa'),
          editor.property('ulkomaanjaksot').property('kuvaus').setValue('Ulkomaanjakso'),
          editor.property('erityisenKoulutustehtävänJaksot').addItem,
          editor.property('erityisenKoulutustehtävänJaksot').propertyBySelector('.alku').setValue('1.9.2012'),
          editor.property('erityisenKoulutustehtävänJaksot').propertyBySelector('.loppu').setValue('4.6.2016'),
          editor.property('erityisenKoulutustehtävänJaksot').property('tehtävä').setValue('Erityisenä koulutustehtävänä kieli ja kansainvälisyys'),
          editor.saveChanges,
          wait.until(page.isSavedLabelShown)
        )
        it('tallentaa ja esittää kaikki lisätiedot', function() {
          expect(extractAsText(S('.lisätiedot'))).to.equal('Lisätiedot\n' +
            'Pidennetty päättymispäivä kyllä\n' +
            'Ulkomainen vaihto-opiskelija. kyllä\n' +
            'Erityisen koulutustehtävän jaksot 1.9.2012 — 4.6.2016 Tehtävä Erityisenä koulutustehtävänä kieli ja kansainvälisyys\n' +
            'Ulkomaanjaksot 4.1.2013 — 16.3.2013 Maa Ahvenanmaa Kuvaus Ulkomaanjakso')
        })
      })

      describe('Lisätietojen muokkaus', function() {
        before(
          editor.edit,
          editor.property('pidennettyPäättymispäivä').setValue(false),
          editor.property('ulkomainenVaihtoopiskelija').setValue(false),
          editor.property('ulkomaanjaksot').propertyBySelector('.alku').setValue('5.1.2013'),
          editor.property('ulkomaanjaksot').propertyBySelector('.loppu').setValue('14.2.2013'),
          editor.property('ulkomaanjaksot').property('maa').setValue('Ruotsi'),
          editor.property('ulkomaanjaksot').property('kuvaus').setValue('Jotain muuta'),
          editor.property('ulkomaanjaksot').addItem,
          editor.property('ulkomaanjaksot').propertyBySelector('.alku:last').setValue('15.2.2013'),
          editor.property('ulkomaanjaksot').propertyBySelector('.loppu:last').setValue('29.4.2013'),
          editor.property('ulkomaanjaksot').property('maa:last').setValue('Norja'),
          editor.property('ulkomaanjaksot').property('kuvaus:last').setValue('Ja vielä jotain'),
          editor.property('erityisenKoulutustehtävänJaksot').propertyBySelector('.alku').setValue('1.9.2012'),
          editor.property('erityisenKoulutustehtävänJaksot').propertyBySelector('.loppu').setValue('4.6.2015'),
          editor.property('erityisenKoulutustehtävänJaksot').property('tehtävä').setValue('Erityisenä koulutustehtävänä taide'),
          editor.saveChanges,
          wait.until(page.isSavedLabelShown)
        )

        it('tallentaa muutokset ja esittää ajantasaiset lisätiedot', function() {
          expect(extractAsText(S('.lisätiedot'))).to.equal('Lisätiedot\n' +
            'Erityisen koulutustehtävän jaksot 1.9.2012 — 4.6.2015 Tehtävä Erityisenä koulutustehtävänä taide\n' +
            'Ulkomaanjaksot 5.1.2013 — 14.2.2013 Maa Ruotsi Kuvaus Jotain muuta\n' +
            '15.2.2013 — 29.4.2013 Maa Norja Kuvaus Ja vielä jotain')
        })
      })

      describe('Lisätietojen poisto', function() {
        before(
          editor.edit,
          editor.property('ulkomaanjaksot').removeItem(0),
          editor.property('ulkomaanjaksot').removeItem(0),
          editor.property('erityisenKoulutustehtävänJaksot').removeItem(0),
          editor.saveChanges,
          wait.until(page.isSavedLabelShown)
        )

        it('poistaa lisätiedot eikä enää esitä niitä', function() {
          expect(isElementVisible(findSingle('.lisätiedot'))).to.equal(false)
        })
      })
    })
  })

  describe('Valmistava DIA-vaihe', function () {
    before(page.openPage, page.oppijaHaku.searchAndSelect('151013-2195'), opinnot.valitseSuoritus(undefined, 'Valmistava DIA-vaihe'))

    describe('Oppijan suorituksissa', function () {
      it('näytetään tutkinto ja oppilaitos', function () {
        expect(opinnot.getTutkinto()).to.equal('Valmistava DIA-vaihe')
        expect(opinnot.getOppilaitos()).to.equal('Helsingin Saksalainen koulu')
      })
    })

    describe('Kaikki tiedot näkyvissä', function () {
      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Valmistava DIA-vaihe\n' +
          'Oppilaitos / toimipiste Helsingin Saksalainen koulu\n' +
          'Suorituskieli englanti\n' +
          'Suoritus valmis Vahvistus : 4.6.2016 Helsinki Reijo Reksi , rehtori')
      })

      it('näyttää oppiaineiden ja kurssien arvosanat', function() {
        expect(extractAsText(S('.osasuoritukset'))).to.equal(
          'Oppiaine Laajuus (vuosiviikkotuntia)\n' +
          'Kielet, kirjallisuus, taide\n' +
          'Äidinkieli, saksa\n10/I\n3 10/II\n5 3\n' +
          'Äidinkieli, suomi\n10/I\n2 10/II\n3 3\n' +
          'A-kieli, englanti\n10/I\n3 3\n' +
          'B1-kieli, ruotsi\n10/I\n2 10/II\n2 3\n' +
          'B3-kieli, venäjä\n10/I\n4 10/II\n3 3\n' +
          'Kuvataide\n10/I\n4 10/II\n5 2\n' +
          'Matematiikka ja luonnontieteet\n' +
          'Matematiikka\n10/I\n3 10/II\n1 4\n' +
          'Fysiikka\n10/I\n3 10/II\n2 2\n' +
          'Kemia\n10/I\n2 10/II\n4 2\n' +
          'Tietotekniikka\n10/I\n1 10/II\n2 2\n' +
          'Yhteiskuntatieteet\n' +
          'Historia\n10/I\n3 10/II\n4 2\n' +
          'Taloustieto ja yhteiskuntaoppi\n10/I\n5 10/II\n3 2\n' +
          'Maantiede (saksa ja englanti)\n10/I\n3 10/II\n3 2\n' +
          'Filosofia\n10/I\n1 10/II\n1 2\n' +
          'Lisäaineet\n' +
          'B2-kieli, latina\n10/I\n4 10/II\n4 2'
        )
      })
    })

    describe('Tietojen muuttaminen', function() {
      describe('Päätason suorituksen poistaminen', function() {
        before(editor.edit)

        describe('Mitätöintilinkki', function() {
          it('Ei näytetä', function() {
            expect(opinnot.deletePäätasonSuoritusIsShown()).to.equal(false)
          })
        })
      })

      describe('Valmistavan vaiheen tiedot', function() {
        describe('Suorituskieli', function() {
          before(
            editor.edit,
            opinnot.opiskeluoikeusEditor().property('suorituskieli').setValue('saksa'),
            editor.saveChanges,
            wait.until(page.isSavedLabelShown)
          )

          it('voidaan vaihtaa', function () {
            expect(extractAsText(S('.suorituskieli:last'))).to.equal('Suorituskieli saksa')
          })
        })

        describe('Todistuksella näkyvät lisätiedot', function() {
          before(
            editor.edit,
            opinnot.opiskeluoikeusEditor().property('todistuksellaNäkyvätLisätiedot').setValue('Valmistavan vaiheen lisätieto'),
            editor.saveChanges,
            wait.until(page.isSavedLabelShown)
          )

          it('voidaan lisätä', function () {
            expect(extractAsText(S('.todistuksellaNäkyvätLisätiedot:first'))).to.equal('Todistuksella näkyvät lisätiedot Valmistavan vaiheen lisätieto')
          })
        })
      })

      describe('Suoritusten tiedot', function() {
        describe('Oppiaine', function() {
          var aine = opinnot.oppiaineet.oppiaine('oppiaine.A')

          describe('Laajuuden muuttaminen', function () {
            before(
              editor.edit,
              aine.laajuus.setValue(4),
              editor.saveChanges,
              wait.until(page.isSavedLabelShown)
            )

            it('onnistuu', function () {
              expect(findSingle('.oppiaine.A .laajuus')().text()).to.equal('4')
            })
          })

          describe('Suorituskielen muuttaminen', function () {
            before(
              editor.edit,
              aine.suorituskieli.selectValue('suomi'),
              editor.saveChanges,
              wait.until(page.isSavedLabelShown)
            )

            it('onnistuu', function () {
              expect(findSingle('.oppiaine.A .suorituskieli .value')().text()).to.equal('suomi')
            })
          })

          describe('Oppiaineen osasuoritukset', function() {
            var osasuoritus = aine.propertyBySelector('.kurssi:first')
            var arvosana = osasuoritus.propertyBySelector('.arvosana')

            describe('Arvosana-asteikko', function () {
              before(editor.edit)

              it('on oikea', function () {
                expect(arvosana.getOptions()).to.deep.equal([ 'Ei valintaa', '1', '2', '2-', '3', '4', '5', '6' ])
              })

              after(editor.cancelChanges)
            })

            describe('Arvosanan muuttaminen', function () {
              before(editor.edit, arvosana.selectValue(6), editor.saveChanges, wait.until(page.isSavedLabelShown))

              it('onnistuu', function () {
                expect(findFirst('.oppiaine.A .kurssi:first .arvosana')().text()).to.equal('6')
              })
            })

            describe('Lisääminen', function() {
              var dialog = aine.lisääKurssiDialog

              before(
                editor.edit,
                aine.avaaLisääKurssiDialog,
                dialog.valitseKurssi('2 10/II'),
                dialog.lisääKurssi,
                aine.propertyBySelector('.kurssi:last > .arvosana').selectValue(2),
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('toimii', function () {
                expect(extractAsText(S('.oppiaineet .A'))).to.contain('10/II\n2')
              })
            })

            describe('Kun kaksi lukukautta on jo lisätty', function() {
              var dialog = aine.lisääKurssiDialog

              before(
                editor.edit,
                aine.avaaLisääKurssiDialog
              )

              it('lisääminen ei ole sallittu', function() {
                expect(isElementVisible(dialog.propertyBySelector('.kurssi'))).to.equal(false)
                expect(dialog.canSave()).to.equal(false)
              })

              after(
                dialog.sulje,
                editor.cancelChanges
              )
            })

            describe('Poistaminen', function() {
              before(
                editor.edit,
                aine.kurssi('10/II').poistaKurssi,
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('toimii', function () {
                expect(extractAsText(S('.oppiaineet .A'))).to.not.contain('10/II')
              })
            })
          })

          describe('Lisääminen', function () {
            var uusiOppiaine = OpinnotPage().opiskeluoikeusEditor().propertyBySelector('.uusi-oppiaine:last')

            before(
              editor.edit,
              uusiOppiaine.selectValue('Liikunta')
            )

            it('lisää oppiaineen', function () {
              expect(S('.oppiaineet .oppiaine-rivi').length).to.equal(16)
            })

            describe('Tiedot täytettynä', function () {
              var liikunta = opinnot.oppiaineet.oppiaine('oppiaine.LI')
              before(
                liikunta.propertyBySelector('tr.laajuus').setValue('2'),
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('tallennus toimii', function () {
                expect(extractAsText(S('.oppiaineet'))).to.contain('Liikunta')
              })
            })
          })

          describe('Poistaminen', function () {
            var liikunta = opinnot.oppiaineet.oppiaine('oppiaine.LI')

            before(
              editor.edit,
              liikunta.propertyBySelector('.remove-row').removeValue,
              editor.saveChanges,
              wait.until(page.isSavedLabelShown)
            )

            it('toimii', function () {
              expect(extractAsText(S('.oppiaineet'))).to.not.contain('Liikunta')
            })
          })
        })
      })
    })
  })

  describe('Deutsche Internationale Abitur', function () {
    before(page.openPage, page.oppijaHaku.searchAndSelect('151013-2195'), opinnot.valitseSuoritus(undefined, 'Deutsche Internationale Abitur'))

    describe('Oppijan suorituksissa', function () {
      it('näytetään', function () {
        expect(opinnot.getTutkinto()).to.equal('Deutsche Internationale Abitur; Reifeprüfung')
        expect(opinnot.getOppilaitos()).to.equal('Helsingin Saksalainen koulu')
      })
    })

    describe('Kaikki tiedot näkyvissä', function () {
      it('näyttää suorituksen tiedot', function() {
        expect(extractAsText(S('.suoritus > .properties, .suoritus > .tila-vahvistus'))).to.equal(
          'Koulutus Deutsche Internationale Abitur; Reifeprüfung\n' +
          'Oppilaitos / toimipiste Helsingin Saksalainen koulu\n' +
          'Kokonaispistemäärä 870\n' +
          'Suorituskieli englanti\n' +
          'Suoritus valmis Vahvistus : 4.6.2016 Helsinki Reijo Reksi , rehtori')
      })

      it('näyttää oppiaineiden ja kurssien arvosanat', function() {
        expect(extractAsText(S('.osasuoritukset'))).to.equal(
          'Oppiaine Laajuus (vuosiviikkotuntia)\n' +
          'Kielet, kirjallisuus, taide\n' +
          'Äidinkieli, saksa\n11/I\n3 11/II\n5 12/I\n4 12/II\n3 10\n' +
          'Äidinkieli, suomi\n11/I\n2 11/II\n3 12/I\n3 12/II\n3 8\n' +
          'A-kieli, englanti\n11/I\n2 11/II\n3 12/I\n2 6\n' +
          'B1-kieli, ruotsi\n11/I\n2 11/II\n2 12/I\n4 12/II\n3 6\n' +
          'B3-kieli, venäjä\n11/I\n4 11/II\n3 12/I\n4 12/II\n3 6\n' +
          'Kuvataide\n11/I\n4 11/II\n3 12/I\n2 12/II\n2 4\n' +
          'Matematiikka ja luonnontieteet\n' +
          'Matematiikka\n11/I\n3 11/II\n1 12/I\n1 12/II\n2 8\n' +
          'Fysiikka\n11/I\n2 11/II\n2 12/I\n1 12/II\n1 6\n' +
          'Kemia\n11/I\n3 11/II\n2 12/I\n1 12/II\n2 6\n' +
          'Tietotekniikka\n11/I\n2 11/II\n1 12/I\n1 12/II\n1 4\n' +
          'Yhteiskuntatieteet\n' +
          'Historia\nSuorituskieli suomi\n11/I\n3 11/II\n4 12/I\n3 12/II\n1 6\n' +
          'Taloustieto ja yhteiskuntaoppi\n11/I\n4 11/II\n3 12/I\n2 12/II\n3 6\n' +
          'Maantiede (saksa ja englanti)\n11/I\n3 11/II\n5 12/I\n3 12/II\n2 6\n' +
          'Filosofia\n11/I\n2 11/II\n2 12/I\n2 12/II\n2 4\n' +
          'Lisäaineet\n' +
          'B2-kieli, latina\n11/I\n3 11/II\n3 12/I\n2 12/II\n2 4\n' +
          'Cambridge Certificate of Advanced English\n12/I\n3 12/II\n1 1\n' +
          'Matematiikka, syventävä\n11/I\n2 11/II\n1 12/I\n2 12/II\n4 2')
      })
    })

    describe('Tietojen muuttaminen', function() {
      describe('Päätason suorituksen poistaminen', function() {
        before(editor.edit)

        describe('Mitätöintilinkki', function() {
          it('Ei näytetä', function() {
            expect(opinnot.deletePäätasonSuoritusIsShown()).to.equal(false)
          })
        })
      })

      describe('Tutkintovaiheen tiedot', function() {
        describe('Kokonaispistemäärä', function() {
          before(
            editor.edit,
            opinnot.opiskeluoikeusEditor().property('kokonaispistemäärä').setValue('850'),
            editor.saveChanges,
            wait.until(page.isSavedLabelShown)
          )

          it('voidaan muuttaa', function () {
            expect(extractAsText(S('.kokonaispistemäärä'))).to.equal('Kokonaispistemäärä 850')
          })
        })

        describe('Suorituskieli', function() {
          before(
            editor.edit,
            opinnot.opiskeluoikeusEditor().property('suorituskieli').setValue('suomi'),
            editor.saveChanges,
            wait.until(page.isSavedLabelShown)
          )

          it('voidaan vaihtaa', function () {
            expect(extractAsText(S('.suorituskieli:first'))).to.equal('Suorituskieli suomi')
          })
        })

        describe('Todistuksella näkyvät lisätiedot', function() {
          before(
            editor.edit,
            opinnot.opiskeluoikeusEditor().property('todistuksellaNäkyvätLisätiedot').setValue('Tässä jotain lisätietoa'),
            editor.saveChanges,
            wait.until(page.isSavedLabelShown)
          )

          it('voidaan lisätä', function () {
            expect(extractAsText(S('.todistuksellaNäkyvätLisätiedot:first'))).to.equal('Todistuksella näkyvät lisätiedot Tässä jotain lisätietoa')
          })
        })
      })

      describe('Suoritusten tiedot', function() {
        describe('Oppiaine', function() {
          var aine = opinnot.oppiaineet.oppiaine('oppiaine.A')

          describe('Laajuuden muuttaminen', function () {
            before(
              editor.edit,
              aine.laajuus.setValue(4),
              editor.saveChanges,
              wait.until(page.isSavedLabelShown)
            )

            it('onnistuu', function () {
              expect(findSingle('.oppiaine.A .laajuus')().text()).to.equal('4')
            })
          })

          describe('Suorituskielen muuttaminen', function () {
            before(
              editor.edit,
              aine.suorituskieli.selectValue('suomi'),
              editor.saveChanges,
              wait.until(page.isSavedLabelShown)
            )

            it('onnistuu', function () {
              expect(findSingle('.oppiaine.A .suorituskieli .value')().text()).to.equal('suomi')
            })
          })

          describe('Oppiaineen osasuoritukset', function() {
            var osasuoritus = aine.propertyBySelector('.kurssi:first')
            var arvosana = osasuoritus.propertyBySelector('.arvosana')

            describe('Arvosana-asteikko', function () {
              before(editor.edit)

              it('on oikea', function () {
                expect(arvosana.getOptions()).to.deep.include.members([ 'Ei valintaa', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', 'Suoritettu' ])
              })

              after(editor.cancelChanges)
            })

            describe('Arvosanan muuttaminen', function () {
              before(editor.edit, arvosana.selectValue(6), editor.saveChanges, wait.until(page.isSavedLabelShown))

              it('onnistuu', function () {
                expect(findFirst('.oppiaine.A .kurssi:first .arvosana')().text()).to.equal('6')
              })
            })

            describe('Lisääminen', function() {
              var dialog = aine.lisääKurssiDialog

              before(
                editor.edit,
                aine.avaaLisääKurssiDialog,
                dialog.valitseKurssi('6 12/II'),
                dialog.lisääKurssi,
                aine.propertyBySelector('.kurssi:last > .arvosana').selectValue(4),
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('toimii', function () {
                expect(extractAsText(S('.oppiaineet .A'))).to.contain('12/II *\n4')
              })
            })

            describe('Lasketaan kokonaispistemäärään -valinnan lisääminen', function() {
              var kurssi = aine.kurssi('12/II')

              before(
                editor.edit,
                kurssi.toggleDetails,
                kurssi.details().property('lasketaanKokonaispistemäärään').setValue(true),
                kurssi.toggleDetails,
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('tallentuu ja muutos näkyy kurssin tiedoissa', function () {
                expect(extractAsText(S('.oppiaineet .A'))).to.contain('12/II\n4')
              })
            })

            describe('Lasketaan kokonaispistemäärään -valinnan poistaminen', function() {
              var kurssi = aine.kurssi('12/II')

              before(
                editor.edit,
                kurssi.toggleDetails,
                kurssi.details().property('lasketaanKokonaispistemäärään').setValue(false),
                kurssi.toggleDetails,
                editor.saveChanges,
                wait.until(page.isSavedLabelShown),
              )

              it('poistuu ja muutos näkyy kurssin tiedoissa', function () {
                expect(extractAsText(S('.oppiaineet .A'))).to.contain('12/II *\n4')
              })
            })

            describe('Kun neljä lukukautta on jo lisätty', function() {
              var dialog = aine.lisääKurssiDialog

              before(
                editor.edit,
                aine.avaaLisääKurssiDialog
              )

              it('voi lisätä enää kirjallisen tai suullisen kokeen tai näyttötutkinnon', function() {
                expect(dialog.kurssit()).to.deep.equal([
                  'kirjallinenkoe Kirjallinen koe',
                  'nayttotutkinto Erityisosaamisen näyttötutkinto',
                  'suullinenkoe Suullinen koe'
                ])
              })

              after(
                dialog.sulje,
                editor.cancelChanges
              )
            })

            describe('Päättökokeet', function() {
              function testaaPäättökokeenLisäysJaPoisto(koodi, nimi, arvosana) {
                describe(nimi, function() {
                  var dialog = aine.lisääKurssiDialog

                  describe('Lisääminen', function() {
                    before(
                      editor.edit,
                      aine.avaaLisääKurssiDialog,
                      dialog.valitseKurssi(koodi + ' ' + nimi),
                      dialog.lisääKurssi,
                      aine.kurssi(nimi).arvosana.selectValue(arvosana),
                      aine.kurssi(nimi).toggleDetails,
                      aine.kurssi(nimi).details().property('lasketaanKokonaispistemäärään').setValue(true),
                      aine.kurssi(nimi).toggleDetails,
                      editor.saveChanges,
                      wait.until(page.isSavedLabelShown)
                    )

                    it('lisää päättökokeen ja näyttää sen kurssilistauksessa', function () {
                      expect(aine.text()).to.contain(nimi + '\n' + arvosana)
                    })
                  })

                  describe('Poistaminen', function() {
                    before(
                      editor.edit,
                      aine.kurssi(nimi).poistaKurssi,
                      editor.saveChanges,
                      wait.until(page.isSavedLabelShown)
                    )

                    it('poistaa päättökokeen eikä näytä sitä enää kurssilistauksessa', function () {
                      expect(aine.text()).to.not.contain(nimi)
                    })
                  })
                })
              }

              testaaPäättökokeenLisäysJaPoisto('kirjallinenkoe', 'Kirjallinen koe', 10)
              testaaPäättökokeenLisäysJaPoisto('suullinenkoe', 'Suullinen koe', 9)
              testaaPäättökokeenLisäysJaPoisto('nayttotutkinto', 'Erityisosaamisen näyttötutkinto', 11)
            })

            describe('Poistaminen', function() {
              before(
                editor.edit,
                aine.kurssi('12/II').poistaKurssi,
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('toimii', function () {
                expect(extractAsText(S('.oppiaineet .A'))).to.not.contain('12/II')
              })
            })
          })

          describe('Lisääminen', function () {
            var uusiOppiaine = OpinnotPage().opiskeluoikeusEditor().propertyBySelector('.uusi-oppiaine:last')

            before(
              editor.edit,
              uusiOppiaine.selectValue('Lakitieto')
            )

            it('lisää oppiaineen', function () {
              expect(S('.oppiaineet .oppiaine-rivi').length).to.equal(18)
            })

            describe('Tiedot täytettynä', function () {
              var lakitieto = opinnot.oppiaineet.oppiaine('oppiaine.LT')
              before(
                lakitieto.propertyBySelector('tr.laajuus').setValue('1'),
                editor.saveChanges,
                wait.until(page.isSavedLabelShown)
              )

              it('tallennus toimii', function () {
                expect(extractAsText(S('.oppiaineet'))).to.contain('Lakitieto')
              })
            })
          })

          describe('Poistaminen', function () {
            var lakitieto = opinnot.oppiaineet.oppiaine('oppiaine.LT')

            before(
              editor.edit,
              lakitieto.propertyBySelector('.remove-row').removeValue,
              editor.saveChanges,
              wait.until(page.isSavedLabelShown)
            )

            it('toimii', function () {
              expect(extractAsText(S('.oppiaineet'))).to.not.contain('Lakitieto')
            })
          })
        })
      })
    })
  })
})
