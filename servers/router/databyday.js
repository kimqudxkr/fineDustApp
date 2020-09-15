const express = require('express');
const router = express.Router();
const moment = require('moment');
const connection = require("../connection");

const getDustStatus = (value) => {
  if (value <= 30) {
    return 'blue'
  } 
  else if (value > 30 && value <= 80) {
    return 'green'
  }
  else if (value > 80 && value <= 150) {
    return 'yellow'
  }
  else if (value > 150 && value <= 600) {
    return 'red'
  }
  else {
    return 'blue'
  }
}

const getUltraFineDustStatus = (value) => {
  if (value <= 15) {
    return 'blue'
  } 
  else if (value > 15 && value <= 35) {
    return 'green'
  }
  else if (value > 35 && value <= 75) {
    return 'yellow'
  }
  else if (value > 75 && value <= 500) {
    return 'red'
  }
  else {
    return 'blue'
  }
}

const range = ['PM10_0 <= 30', 'PM10_0 > 30 AND PM10_0 <= 80', 'PM10_0 > 80 AND PM10_0 <= 150', 'PM10_0 > 150',
               'PM2_5 <= 15', 'PM2_5 > 15 AND PM2_5 <= 35', 'PM2_5 > 35 AND PM2_5 <= 75', 'PM2_5 > 75'];

const countQuery = (time) => {
  let subQuery='';
  for(let i=0; i<range.length; i++) {
    subQuery += `(SELECT COUNT(*) as data FROM finedust_tb WHERE `;
    if(time)
      subQuery += time;
    subQuery += ` ${range[i]}) union all `
  }
  let query2 = `SELECT * FROM (` + subQuery;
  let resQuery = query2.substring(0,query2.length-11) + `)t`;

  return resQuery;
}

const selectOption = (params) => {
  switch (params.setting) {
    case "user":
      start = `${params.startDay} ${params.startHour}:00:00`;
      end = `${params.endDay} ${params.endHour}:00:00`;
      time = `rgst_dt >= '${start}' AND rgst_dt <= '${end}'`
      return time;
    case "quater":
      time = `quarter(rgst_dt) = ${params.quater}`;
      return time;
    case "year":
      time = `year(rgst_dt) = ${params.year}`;
      return time;
    case "month":
      time = `month(rgst_dt) = ${params.month}`;
      return time;
    case "week":
      time = `year(rgst_dt) = ${params.year} and month(rgst_dt) = ${params.month} and 
              (week(rgst_dt) - week('${params.year}-${params.month}-01') + 1 = ${params.week})`
      return time;
  }
}

/* GET databyday page. */
router.get('/', (req, res, next) => {
  let countData;
  
  connection.query(countQuery(false), (err,rows) => {
  if(!err) {
    countData = rows
    } else {
    console.log(err);
    }
  })

  const query = `
    SELECT MAX(pm10_0) AS dust, 
           MAX(pm2_5) AS ultrafine, 
           AVG(windDirection) AS windDirection, 
           ROUND(AVG(substr(windSpeed, 1, 3)), 2) AS windSpeed, 
           ROUND(AVG(temperature), 1) As temperature,
           ROUND(AVG(humidity), 1) AS humidity,
           rgst_dt 
    FROM finedust_tb 
    GROUP BY SUBSTR(rgst_dt, 1, 10) 
    ORDER BY rgst_dt DESC LIMIT 30
  `;

  connection.query(query, (err, rows, fields) => {
    if (!err) {
      res.render('content/databyday', {'datas': rows.map(data => {
                                            return {
                                              dust: data.dust,
                                              dustStatus: getDustStatus(data.dust),
                                              ultrafine: data.ultrafine,
                                              ultrafineStatus: getUltraFineDustStatus(data.ultrafine),
                                              windDirection: data.windDirection,
                                              windSpeed: data.windSpeed,
                                              temperature: data.temperature,
                                              humidity: data.humidity,
                                              rgst_dt: moment(data.rgst_dt).format('YYYY-MM-DD')
                                            }
                                          })
                                  ,'countData':countData});
    }
    else {
      console.log(err);
      res.render('content/databyday', err);
    }
  })
})

router.get('/api/search', (req, res, next) => {
  const params = req.query;
  let time = selectOption(params);

  let query = `
        SELECT MAX(pm10_0) AS dust, 
              MAX(pm2_5) AS ultrafine, 
              AVG(windDirection) AS windDirection, 
              ROUND(AVG(substr(windSpeed, 1, 3)), 2) AS windSpeed, 
              ROUND(AVG(temperature), 1) As temperature,
              ROUND(AVG(humidity), 1) AS humidity,
              rgst_dt 
        FROM finedust_tb WHERE ${time} 
        GROUP BY SUBSTR(rgst_dt, 1, 10) 
        ORDER BY rgst_dt DESC 
      `;

  connection.query(query, (err, rows, fields) => {
    if (!err) {
      let result;
      const dateFormat = {'13': 'MM-DD:HH', '10': 'YYYY-MM-DD', '18': 'MM-DD HH:mm:ss'};

      rows.forEach(data => {
        const html = `
          <tr>
            <td>${moment(data.rgst_dt).format(dateFormat['10'])}</td>
            <td class="${getDustStatus(data.dust)}">●</td>
            <td>${data.dust}</td>
            <td class="${getUltraFineDustStatus(data.ultrafine)}">●</td>
            <td>${data.ultrafine}</td>
            <td>
              <img class="wind-direction-icon" src="images/arrow-icon.png" alt="wind-direction" style="width: 40px; transform: rotate(${data.windDirection}deg);" />
            </td>
            <td>${data.windSpeed} (m/s)</td>
            <td>${data.temperature} °C</td>
            <td>${data.humidity} %</td>
          </tr>
        `
        result += html;
      });
      res.send(result);
    }
    else {
      console.log(err);
      res.send(err);
    }
  })
})

router.get('/api/search/count', (req, res, next) => {
  const params = req.query;
  let time = selectOption(params);

  let timeQuery = ` ${time} AND `;

  // countQuery(timeQuery)
  connection.query(`select count(case when PM10_0 <= 30 AND ${time} then 1 end) as fd_gd,
  count(case when PM10_0 > 30 and PM10_0 <= 80 AND ${time} then 1 end) as fd_nm,
      count(case when PM10_0 > 80 and PM10_0 <= 150 AND ${time} then 1 end) as fd_bd,
      count(case when PM10_0 > 150 AND ${time} then 1 end) as fd_vb,
      count(case when PM2_5 <= 15 AND ${time} then 1 end) as ufd_gd,
  count(case when PM2_5 > 15 and PM2_5 <= 35 AND ${time} then 1 end) as ufd_nm,
      count(case when PM2_5 > 35 and PM2_5 <= 75 AND ${time} then 1 end) as ufd_bd,
      count(case when PM2_5 > 75 AND ${time} then 1 end) as ufd_vb
from finedust_tb;`, (err, rows, fields) => {
    if (!err) {
      let html = `
      <div class="row">&nbsp;&nbsp;미세먼지&nbsp;&nbsp; - |
        <div class="col-2">좋음 : ${rows[0].fd_gd}회</div>
        <div class="col-2">보통 : ${rows[0].fd_nm}회</div>
        <div class="col-2">나쁨 : ${rows[0].fd_bd}회</div>
        <div class="col-2">매우나쁨 : ${rows[0].fd_vb}회</div>
      </div>
      <div class="row">초미세먼지 - |
        <div class="col-2">좋음 : ${rows[0].ufd_gd}회</div>
        <div class="col-2">보통 : ${rows[0].ufd_nm}회</div>
        <div class="col-2">나쁨 : ${rows[0].ufd_bd}회</div>
        <div class="col-2">매우나쁨 : ${rows[0].ufd_vb}회</div>
      </div>
      `
      res.send(html);
    }
    else {
      console.log(err);
      res.send(err);
    }
  })
})

module.exports = router;