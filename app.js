import fetch from 'node-fetch';

let currentMD101_SN = null; // 이전 요청의 MD101_SN 값을 저장하는 변수

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

function sendMessageToDiscord(embedColor, emerStep, md101_SN, content, type, region, createdDT) {
  const webhookURL = 'https://discord.com/api/webhooks/1128705951025868830/EZmipL1rYcxicoes25p4r-4U8-uBTkn0ts5ceWJ2YcR5-85IneL0d_aV8b2Fy7ikNYk4';

  const SendCurrent = new Date();
  const resSendDate = SendCurrent.toISOString();

  const payload = {
    content: '<@&1128959006136873001>',
    allowed_mentions: {
      parse: ['users', 'roles'],
    },
    embeds: [
      {
        color: embedColor,
        title: `${emerStep}문자`,
        url: `https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/sfc/dis/disasterMsgView.jsp?menuSeq=679&md101_sn=${md101_SN}`,
        description: content,
        fields: [
          {
            name: '재해구분',
            value: type,
            inline: true,
          },
          {
            name: '긴급단계',
            value: emerStep,
            inline: true,
          },
          {
            name: '송출지역',
            value: region,
            inline: true,
          },
        ],
        footer: {
          text: `정보 : 국민재난안전포털 | 발송시각 : ${createdDT} | 현재시각 : ${resSendDate}`,
        },
      },
    ],
  };

  fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        console.log('Failed to send message to Discord.');
      } else {
        console.log('Message sent successfully to Discord.');
      }
    })
    .catch((error) => {
      console.log('Error sending message to Discord:', error.message);
    });
}

function goAPI() {
  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  

  fetch('https://www.safekorea.go.kr/idsiSFK/sfk/cs/sua/web/DisasterSmsList.do', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'ko,en;q=0.9,en-US;q=0.8',
      'Connection': 'keep-alive',
      'Content-Length': '305',
      'Content-Type': 'application/json; charset=UTF-8',
      'Cookie': 'JSESSIONID=OYENxYOQ5Fd-7WZznvWLMigLXAxJDY7MkBtjQwpP.safekorea-app-389-pphcj; _ga=GA1.1.1712781664.1685521370; elevisor_for_j2ee_uid=cqb1mtwtu7a2a; _ga_KPQBFFJFBP=GS1.1.1685521369.1.1.1685521526.0.0.0; e4ade1c2eb8a50001096f60404e196eb=b034c90fa1cf7f2a9fe71d5ea2f76c89; 67f6ba7544cb709c26868ec9f0a31e01=8e2521085f6f7a16e287194793d1513b',
      'Host': 'www.safekorea.go.kr',
      'Origin': 'https://www.safekorea.go.kr',
      'Referer': 'https://www.safekorea.go.kr/idsiSFK/neo/sfk/cs/sfc/dis/disasterMsgList.jsp?menuSeq=679',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({
      searchInfo: {
        pageIndex: '1',
        pageUnit: '1',
        pageSize: '1',
        firstIndex: '1',
        lastIndex: '1',
        recordCountPerPage: '1',
        searchBgnDe: formattedDate,
        searchEndDe: formattedDate,
        searchGb: '1',
        searchWrd: '',
        rcv_Area_Id: '',
        dstr_se_Id: '',
        c_ocrc_type: '',
        sbLawArea1: '',
        sbLawArea2: '',
        sbLawArea3: '',
      },
    }),
  })
    .then((response) => {
      return response.json(); // JSON 데이터로 변환
    })
    .then((data) => {
      const firstItem = data.disasterSmsList[0];
      const type = firstItem.DSSTR_SE_NM;
      const region = firstItem.RCV_AREA_NM;
      const content = firstItem.MSG_CN;
      const emerStep = firstItem.EMRGNCY_STEP_NM;
      const md101_SN = firstItem.MD101_SN;
      const createdDT = firstItem.CREAT_DT;

      if (currentMD101_SN !== null && currentMD101_SN !== md101_SN) {
        const embedColorMap = {
          '안전안내': 5031783,
          '긴급재난': 27391,
          '위급재난': 16711760,
        };
        const embedColor = embedColorMap[emerStep] || 0;

        console.log(`Updated! ${md101_SN}`);
        sendMessageToDiscord(embedColor, emerStep, md101_SN, content, type, region, createdDT);

        currentMD101_SN = md101_SN;
      } else if (currentMD101_SN === null) {
        const embedColorMap = {
          '안전안내': 5031783,
          '긴급재난': 27391,
          '위급재난': 16711760,
        };
        const embedColor = embedColorMap[emerStep] || 0;

        console.log(`Updated! ${md101_SN}`);
        sendMessageToDiscord(embedColor, emerStep, md101_SN, content, type, region, createdDT);

        currentMD101_SN = md101_SN;
      }
    })
    .catch((error) => {
      console.log('Request failed:', error.message);
    });
}

// Call the function every 5 seconds
setInterval(goAPI, 5000);
