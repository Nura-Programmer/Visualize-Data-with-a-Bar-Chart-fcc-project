const [width, height, bar_width] = [800, 400, 800 / 275];
const dollars_regEx = /(\d)(?=(\d{3})+\.)/g;
const [MORE_INFO, DATA_URL] = [
  'More Information: http://www.bea.gov/national/pdf/nipaguid.pdf',
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json',
];

const container = {
  svg_container: d3
    .select('.visual')
    .append('svg')
    .attr('width', width + 100)
    .attr('height', height + 60),
  tooltip: d3
    .select('.visual')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'flex'),
};

d3.json(DATA_URL)
  .then((response) => initProject(response))
  .catch(console.error);

const getQuarter = (month) => {
  switch (month) {
    case '01':
      return 'Q1';
    case '04':
      return 'Q2';
    case '07':
      return 'Q3';
    case '10':
      return 'Q4';
    default:
      return 'Error';
  }
};

const initProject = (response) => {
  const { data, name } = response;
  const { svg_container, tooltip } = container;
  const years = [];
  const years_date = [];
  const GDP = [];

  data.forEach((item) => {
    const [date, gdp] = item;
    GDP.push(gdp);
    years_date.push(new Date(date));
    years.push(date.slice(0, 4) + ' ' + getQuarter(date.slice(5, 7)));
  });

  const gdp_max = d3.max(GDP);
  const linear_scale = d3.scaleLinear().domain([0, gdp_max]).range([0, height]);
  const scaleGdp = GDP.map((_datum) => linear_scale(_datum));
  const x_max = new Date(d3.max(years_date));
  x_max.setMonth(x_max.getMonth() + 3);

  const x_scale = d3
    .scaleTime()
    .domain([d3.min(years_date), x_max])
    .range([0, width]);

  const x_axis = d3.axisBottom().scale(x_scale);
  const y_axis = d3.axisLeft(
    d3.scaleLinear().domain([0, gdp_max]).range([height, 0])
  );

  svg_container
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -200)
    .attr('y', 80)
    .text(name.slice(0, 22));

  svg_container
    .append('text')
    .attr('x', width / 2 + 120)
    .attr('y', height + 50)
    .attr('class', 'svg-info')
    .text(MORE_INFO);

  svg_container
    .append('g')
    .call(x_axis)
    .attr('id', 'x-axis')
    .attr('transform', 'translate(60, 400)');

  svg_container
    .append('g')
    .call(y_axis)
    .attr('id', 'y-axis')
    .attr('transform', 'translate(60, 0)');

  d3.select('svg')
    .selectAll('rect')
    .data(scaleGdp)
    .enter()
    .append('rect')
    .attr('data-date', (_datum, i) => data[i][0])
    .attr('data-gdp', (_datum, i) => data[i][1])
    .attr('class', 'bar')
    .attr('x', (_datum, i) => x_scale(years_date[i]))
    .attr('y', (_datum) => height - _datum)
    .attr('height', (_datum) => _datum)
    .attr('width', bar_width)
    .attr('index', (_datum, i) => i)
    .attr('transform', 'translate(60, 0)')
    .style('fill', 'hsl(100, 100%, 30%)')
    .on('mouseover', function (e, _datum) {
      const i = this.getAttribute('index');
      const dollars = GDP[i].toFixed(1).replace(dollars_regEx, '$1,');

      tooltip.transition().duration(150).style('opacity', 0.8);
      tooltip
        .html(`${years[i]}<br/>$${dollars} Billion`)
        .attr('data-date', data[i][0])
        .style('left', i * bar_width + 30 + 'px')
        .style('top', height - 100 + 'px')
        .style('transform', 'translateX(60px)');
    })
    .on('mouseout', () => {
      tooltip.transition().duration(150).style('opacity', 0);
    });
};
