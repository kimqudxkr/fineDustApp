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

/* GET info page. */
router.get('/', (req, res, next) => {
  let countData;

  const query1 = `SELECT * FROM (
    (SELECT COUNT(*) as data FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) <= 15)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) > 15 AND MAX(PM10_0) <= 40)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) > 40 AND MAX(PM10_0) <= 75)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) > 75)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) <= 15)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) > 15 AND MAX(PM2_5) <= 35)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) > 35 AND MAX(PM2_5) <= 75)t)) union all
    (SELECT COUNT(*) FROM (
      (SELECT * FROM finedust_tb GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) > 75)t))                
     )t`;

  connection.query(query1, (err,rows) => {
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
      res.render('content/info', {'datas': rows.map(data => {
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
      res.render('content/info', err);
    }
  })
})

router.get('/api/search', (req, res, next) => {
  const params = req.query;
  let start;
  let end;
  let time;

  switch (params.setting) {
    case "user":
      start = `${params.startDay} ${params.startHour}:00:00`;
      end = `${params.endDay} ${params.endHour}:00:00`;
      time = `rgst_dt >= '${start}' AND rgst_dt <= '${end}'`
      break;
    case "quater":
      time = `quarter(rgst_dt) = ${params.quater}`;
      break;
    case "year":
      time = `year(rgst_dt) = ${params.year}`;
      break;
    case "month":
      time = `month(rgst_dt) = ${params.month}`;
      break;
    case "week":
      if(params.week == 5) {
        start = `${params.year}-${params.month}-${(params.week-1)*7+1}`
        end = `'${params.year}-${params.month*1+1}-01'`
        time = `rgst_dt >= '${start}' AND rgst_dt < ${end}`
      } else {
        start = `${params.year}-${params.month}-${(params.week-1)*7+1}`
        end = `${params.year}-${params.month}-${params.week*7+1}`
        time = `rgst_dt >= '${start}' AND rgst_dt < '${end}'`
      }
      console.log(end);
      break;
  }

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
  let start;
  let end;
  let time;

  switch (params.setting) {
    case "user":
      start = `${params.startDay} ${params.startHour}:00:00`;
      end = `${params.endDay} ${params.endHour}:00:00`;
      time = `rgst_dt >= '${start}' AND rgst_dt <= '${end}'`
      break;
    case "quater":
      time = `quarter(rgst_dt) = ${params.quater}`;
      break;
    case "year":
      time = `year(rgst_dt) = ${params.year}`;
      break;
    case "month":
      time = `month(rgst_dt) = ${params.month}`;
      break;
    case "week":
      if(params.week == 5) {
        start = `${params.year}-${params.month}-${(params.week-1)*7+1}`
        end = `'${params.year}-${params.month*1+1}-01'`
        time = `rgst_dt >= '${start}' AND rgst_dt < ${end}`
      } else {
        start = `${params.year}-${params.month}-${(params.week-1)*7+1}`
        end = `${params.year}-${params.month}-${params.week*7+1}`
        time = `rgst_dt >= '${start}' AND rgst_dt < '${end}'`
      }
      break;
  }

  let query = `SELECT * FROM (
 (SELECT COUNT(*) as data FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) <= 15)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) > 15 AND MAX(PM10_0) <= 40)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) > 40 AND MAX(PM10_0) <= 75)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM10_0) > 75)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) <= 15)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) > 15 AND MAX(PM2_5) <= 35)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) > 35 AND MAX(PM2_5) <= 75)t)) union all
 (SELECT COUNT(*) FROM (
   (SELECT * FROM finedust_tb WHERE ${time} GROUP BY SUBSTR(rgst_dt, 1, 10) HAVING MAX(PM2_5) > 75)t))                
  )t`;

  connection.query(query, (err, rows, fields) => {
    if (!err) {
      let html = `
      <div class="row">미세먼지 - |
        <div class="col-2">좋음 : ${rows[0].data}회</div>
        <div class="col-2">보통 : ${rows[1].data}회</div>
        <div class="col-2">나쁨 : ${rows[2].data}회</div>
        <div class="col-2">매우나쁨 : ${rows[3].data}회</div>
      </div>
      <div class="row">초미세먼지 - |
        <div class="col-2">좋음 : ${rows[4].data}회</div>
        <div class="col-2">보통 : ${rows[5].data}회</div>
        <div class="col-2">나쁨 : ${rows[6].data}회</div>
        <div class="col-2">매우나쁨 : ${rows[7].data}회</div>
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