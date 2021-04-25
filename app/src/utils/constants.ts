import moment from 'moment'

const constants = {
  MONTHS: {
    JANUARY: 'January',
    FEBRUARY: 'February',
    MARCH: 'March',
    APRIL: 'April',
    MAY: 'May',
    JUNE: 'June',
    JULY: 'July',
    AUGUST: 'August',
    SEPTEMBER: 'September',
    OCTOBER: 'October',
    NOVEMBER: 'November',
    DECEMBER: 'December',
  },
  MOMENT: {
    DEFAULT_DATE: moment().format('MM-YYYY'),
  },
}

export default constants
