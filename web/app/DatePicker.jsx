import DayPicker, {DateUtils} from 'react-day-picker'
import {parseFinnishDate, formatFinnishDate} from './date.js'
import React from 'react'

export default React.createClass({
  render() {
    const {from, to, displayedStartMonth, displayedEndMonth} = this.state
    return (
      <div className="calendar" onMouseDown={ this.handleContainerMouseDown } tabIndex="0" onBlur={this.handleInputBlur}
           onFocus={this.handleInputFocus}>
        <div
          className="calendar-selection">{ from && to ? (formatFinnishDate(from) + '-' + formatFinnishDate(to)) : 'kaikki'}</div>
        { this.state.open &&
        <div className="DayPicker-CalendarContainer">
          <DayPicker
            onDayClick={ this.handleDayClick }
            selectedDays={ day => DateUtils.isDayInRange(day, {from, to}) }
            locale="fi"
            localeUtils={localeUtils}
            initialMonth={displayedStartMonth}
            fixedWeeks
            onMonthChange={ this.handleStartMonthChange}
            toMonth={ DateUtils.addMonths(displayedEndMonth, -1) }
          />
          <DayPicker
            onDayClick={ this.handleDayClick }
            selectedDays={ day => DateUtils.isDayInRange(day, {from, to}) }
            locale="fi"
            localeUtils={localeUtils}
            fromMonth={ DateUtils.addMonths(displayedStartMonth, 1)}
            onMonthChange={ this.handleEndMonthChange}
            fixedWeeks
          />
          <div className="calendar-shortcuts">
            <button className="button">kaikki</button>
            <button className="button">kuluva vuosi</button>
            <button className="button">edellinen vuosi</button>
          </div>
        </div>
        }
      </div>
    )
  },
  handleStartMonthChange(day) {
    this.setState({
      displayedStartMonth: day
    })
  },
  handleEndMonthChange(day) {
    this.setState({
      displayedEndMonth: day
    })
  },
  handleDayClick(e, day) {
    this.setState(DateUtils.addDayToRange(day, this.state), () => {
      this.state.from && this.state.to && this.props.onSelectionChanged({
        from: this.state.from,
        to: this.state.to
      })
    })
  },
  getInitialState() {
    const from = this.props.selectedStartDay && parseFinnishDate(this.props.selectedStartDay)
    const to = this.props.selectedEndDay && parseFinnishDate(this.props.selectedEndDay)

    return {
      displayedStartMonth: from ? from : new Date(new Date().getFullYear(), 0, 1),
      displayedEndMonth: to ? to : new Date(),
      open: false,
      from: from,
      to: to
    }
  },
  componentDidMount() {
    window.addEventListener('click', this.handleClickOutside, false)
  },
  componentWillUnmount() {
    window.removeEventListener('click', this.handleClickOutside, false)
  },
  handleClickOutside(e) {
    !e.target.closest('.calendar') && this.setState({open: false})
  },
  handleContainerMouseDown() {
    this.clickedInside = true
    this.clickTimeout = setTimeout(() => {
      this.clickedInside = false
    }, 0)
  },
  handleInputFocus() {
    this.setState({open: true})
  },
  handleInputBlur() {
    this.setState({open: this.clickedInside})
  }
})

const weekdaysLong = {
  fi: ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}
const weekdaysShort = {
  fi: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
}
const months = {
  fi: ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}
const firstDayOfWeek = {
  fi: 1,
  en: 0
}

const localeUtils = {
  formatDay: (d, locale = 'en') => `${weekdaysLong[locale][d.getDay()]}, ${d.getDate()} ${months[locale][d.getMonth()]} ${d.getFullYear()}`,
  formatWeekdayShort: (index, locale = 'en') => weekdaysShort[locale][index],
  formatWeekdayLong: (index, locale = 'en') => weekdaysLong[locale][index],
  getFirstDayOfWeek: locale => firstDayOfWeek[locale],
  getMonths: locale => months[locale],
  formatMonthTitle: (d, locale) => `${months[locale][d.getMonth()]} ${d.getFullYear()}`
}