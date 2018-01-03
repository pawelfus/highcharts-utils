const fs = require('fs');
const yaml = require('js-yaml');
const marked = require('marked');
const branchName = require('current-git-branch');

const highchartsDir = require('./../config.json').highchartsDir;
const samplesDir = `${highchartsDir}samples/`;

/**
 * Get demo.details in form of an object
 */
const getDetails = (path) => {
	let details;
	let detailsFile = samplesDir + path + '/demo.details';
	if (fs.existsSync(detailsFile)) {
		details = fs.readFileSync(detailsFile, 'utf8');
		if (details) {
			details = yaml.load(details);
		}
	}
	return details || {};
}

const getHTML = (req, codePath) => {
	let theme = req.session.theme;
	let path = req.query.path;
	let html =
		fs.readFileSync(
			`${highchartsDir}samples/${path}/demo.html`
		)
		.toString();

	if (codePath) {
		html = html.replace(
			/https:\/\/code\.highcharts\.com/g,
			codePath
		);

		if (html.indexOf(`/${codePath}/mapdata`) !== -1) {
			html = html.replace(
				RegExp(codePath + '\/mapdata', 'g'), 
				'https://code.highcharts.com/mapdata'
			);
		}
		// Theme
		if (theme) {
			html += `
			<script src='${codePath}/themes/${theme}.js'></script>
			`;
		}
	}

	// Old IE
	let safeCodePath = codePath || 'https://code.highcharts.com';
	html += `
	<!--[if lt IE 9]>
	<script src='${safeCodePath}/modules/oldie.js'></script>
	<![endif]-->
	`;


	// Validation
	if (
		html.indexOf('http://code.highcharts.com') !== -1 ||
		html.indexOf('http://www.highcharts.com') !== -1
	) {
		html += `
		<script>
		window.demoError = 'Do not use http in demo.html. Use secure https. ($path)';
		throw window.demoError;
		</script>
		`;
	}

	if (html.indexOf('.src.js') !== -1) {
		html += `
		<script>
		window.demoError = 'Do not use src.js files in demos. Use .js compiled files.';
		throw window.demoError;
		</script>
		`;
	}

	return html;
}

const getBranch = () => {
	return branchName(highchartsDir);
}

const getCSS = (path, codePath) => {
	const cssFile = `${highchartsDir}samples/${path}/demo.css`;
	let css = '';

	if (fs.existsSync(cssFile)) {
		css =
			fs.readFileSync(cssFile)
			.toString();

		if (codePath) {
			css = css.replace(
				/https:\/\/code\.highcharts\.com/g,
				codePath
			);
		}
	}
	return css;
}

const getJS = (path) => {
	let js = fs.readFileSync(
		`${highchartsDir}samples/${path}/demo.js`
	)

	return js;
}

const getResources = (path) => {
	let details = getDetails(path);
	let resources = {
		scripts: [],
		styles: []
	}
	if (details.resources) {
		details.resources.forEach((file) => {
			if (/\.js$/.test(file)) {
				resources.scripts.push(file);
			} else if (/\.css$/.test(file)) {
				resources.styles.push(file);
			}
		})
	}
	return resources;
}

const getReadme = (path) => {
	let file = `${highchartsDir}samples/${path}/readme.md`;
	if (fs.existsSync(file)) {
		return marked(fs.readFileSync(file).toString());
	}
}

const getTestNotes = (path) => {
	let file = `${highchartsDir}samples/${path}/test-notes.html`;
	if (fs.existsSync(file)) {
		return fs.readFileSync(file).toString();
	}
}

module.exports = {
	getBranch: getBranch,
	getDetails: getDetails,
	getHTML: getHTML,
	getCSS: getCSS,
	getJS: getJS,
	getResources: getResources,
	getReadme: getReadme,
	getTestNotes: getTestNotes
};