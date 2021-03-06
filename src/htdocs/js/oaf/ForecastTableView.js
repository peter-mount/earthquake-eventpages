'use strict';


var ForecastView = require('oaf/ForecastView'),
    Formatter = require('core/Formatter'),
    Util = require('util/Util');


var _DEFAULTS = {

};


var ForecastTableView = function (options) {
  var _this,
      _initialize,

      _formatter;


  options = Util.extend({}, _DEFAULTS, options);
  _this = ForecastView(options);

  _initialize = function (options) {
    _this.el.classList.add('oaf-forecast-table-view');

    _formatter = options.formatter || Formatter();
  };

  _this.destroy = Util.compose(function () {
    _this.el.classList.remove('oaf-forecast-table-view');

    _formatter = null;

    _initialize = null;
    _this = null;
  }, _this.destroy);

  _this.getRowHeader = function (info) {
    var th;

    th = document.createElement('th');
    th.setAttribute('scope', 'row');
    th.setAttribute('rowspan', info.bins.length);

    th.innerHTML = [
      '<strong>', info.label, '</strong>',
      '<br/>',
      _formatter.datetime(new Date(info.timeStart)),
      '<br/>through<br/>',
      _formatter.datetime(new Date(info.timeEnd))
    ].join('');

    return th;
  };

  _this.getTable = function (data) {
    var table,
        wrapper;

    wrapper = document.createElement('div');
    wrapper.classList.add('horizontal-scrolling');

    table = wrapper.appendChild(document.createElement('table'));

    table.innerHTML = [
      '<thead>',
        '<tr>',
          '<th scope="col">',
            'Time Window for Analysis',
          '</th>',
          '<th scope="col">',
            'Magnitude (M) range of aftershocks considered',
          '</th>',
          '<th scope="col">',
            'Most likely number of aftershocks (95 % condidence)',
          '</th>',
          '<th scope="col">',
            'Probability of one or more aftershocks',
          '</th>',
        '</tr>',
      '</thead>'
    ].join('');

    table.appendChild(_this.getTableBody(data));

    return wrapper;
  };

  _this.getTableBody = function (data) {
    var body;

    body = document.createElement('tbody');

    data.forecast.forEach(function (info) {
      body.appendChild(_this.getTableRow(info));
    });

    return body;
  };

  _this.getTableRow = function (info) {
    var fragment,
        row;

    fragment = document.createDocumentFragment();

    row = fragment.appendChild(document.createElement('tr'));
    row.classList.add('separator');
    row.appendChild(_this.getRowHeader(info));

    info.bins.forEach(function (bin, index) {
      var detailRow;

      if (index === 0) {
        detailRow = row;
      } else {
        detailRow = fragment.appendChild(document.createElement('tr'));
      }

      detailRow.appendChild(_this.getTableRowDetails(bin));
    });

    return fragment;
  };

  _this.getTableRowDetails = function (bin) {
    var expCell,
        magCell,
        p95Cell,
        row;

    row = document.createDocumentFragment();

    // Magnitude
    magCell = row.appendChild(document.createElement('td'));
    magCell.innerHTML = 'M &ge; ' + bin.magnitude;

    // 95 % confidence
    p95Cell = row.appendChild(document.createElement('td'));
    if (bin.p95minimum + bin.p95maximum) {
      p95Cell.innerHTML = bin.p95minimum + ' to ' + bin.p95maximum;
    } else {
      p95Cell.innerHTML = '*';
    }

    // Expectation
    expCell = row.appendChild(document.createElement('td'));
    if (bin.probability < 0.01) {
      expCell.innerHTML = '&lt; 1 %';
    } else if (bin.probability < 1.0) {
      expCell.innerHTML = _formatter.number(
          bin.probability*100, 0, '&ndash', '%');
    } else {
      expCell.innerHTML = '&gt; 99 %';
    }

    return row;
  };

  _this.renderForecast = function () {
    var footnote,
        topnote;

    _this.el.innerHTML = '';

    topnote = _this.el.appendChild(document.createElement('p'));
    topnote.classList.add('alert');
    topnote.innerHTML = [
      'Note: The expected rate of earthquakes continues to decline throughout ',
      'the time windows. The probabilities in the longer time windows are ',
      'higher only because the rates are being summed over a longer time ',
      'period. These longer periods may be useful when planning recovery ',
      'and rebuliding projects.'
    ].join('');

    _this.el.appendChild(_this.getTable(_this.forecast || {forecast:[]}));

    footnote = _this.el.appendChild(document.createElement('small'));
    footnote.innerHTML = '* Earthquake possible but with a low probability.';
  };


  _initialize(options);
  options = null;
  return _this;
};


module.exports = ForecastTableView;
