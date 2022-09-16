require("isomorphic-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

const dateFormater = (dateData) => {
  const [day, month, date, year] = dateData.split(" ");
  const monthList = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  return [
    date,
    String(monthList.indexOf(month.slice(0, 3).toLowerCase()) + 1).padStart(
      2,
      "0"
    ),
    year,
  ].join("-");
};

(async () => {
  let responseData = {};
  let entriesLength = 0;
  console.log("App starting...");
  console.log("Fetching url...");

  const fetchData = await fetch("https://tradingeconomics.com/calendar");
  console.log("Parsing response...");

  const response = await fetchData.text();
  console.log("Loading response Html...");

  const htmlData = cheerio.load(response);

  entriesLength = htmlData(".table-header").length;

  console.log("Found", entriesLength, "date entries");

  for (let i = 0; i < entriesLength; i++) {
    let parsedData = [];
    const date = htmlData(
      `thead[data-fixed_copy='${i}'] > tr > th:nth-child(1)`
    )
      .text()
      .trim();

    const formattedDate = dateFormater(date);
    const tbodyEntriesLength = htmlData(
      `#calendar > tbody:nth-child(${(i + 1) * 3})`
    ).children().length;
    console.log("Found", tbodyEntriesLength, "entries for date", formattedDate);

    for (let j = 1; j <= tbodyEntriesLength; j++) {
      const prevQuery = `#calendar > tbody:nth-child(${
        (i + 1) * 3
      }) > tr:nth-child(${j})`;

      const data = {
        time: htmlData(prevQuery + "> td:nth-child(1)")
          .html()
          .replace(/<[^>]*>/gm, "")
          .replace(/\n/gm, " ")
          .trim()
          .replace(/\s\s+/g, " "),
        title: htmlData(prevQuery + "> td:nth-child(3)")
          .html()
          .replace(/<[^>]*>/gm, "")
          .replace(/\n/gm, " ")
          .trim()
          .replace(/\s\s+/g, " "),
        metadata: {
          country: htmlData(prevQuery + "> td:nth-child(2)")
            .html()
            .replace(/<[^>]*>/gm, "")
            .replace(/\n/gm, " ")
            .trim()
            .replace(/\s\s+/g, " "),
          actual: htmlData(prevQuery + "> td:nth-child(4)")
            .html()
            .replace(/<[^>]*>/gm, "")
            .replace(/\n/gm, " ")
            .trim()
            .replace(/\s\s+/g, " "),
          previous: htmlData(prevQuery + "> td:nth-child(5)")
            .html()
            .replace(/<[^>]*>/gm, "")
            .replace(/\n/gm, " ")
            .trim()
            .replace(/\s\s+/g, " "),
          consensus: htmlData(prevQuery + "> td:nth-child(6)")
            .html()
            .replace(/<[^>]*>/gm, "")
            .replace(/\n/gm, " ")
            .trim()
            .replace(/\s\s+/g, " "),
          forecast: htmlData(prevQuery + "> td:nth-child(7)")
            .html()
            .replace(/<[^>]*>/gm, "")
            .replace(/\n/gm, " ")
            .trim()
            .replace(/\s\s+/g, " "),
        },
      };
      parsedData.push(data);
    }

    responseData[formattedDate] = parsedData;
  }

  console.log("saving", "result", "to disk");

  fs.writeFileSync(`./result.json`, JSON.stringify(responseData));
})();
