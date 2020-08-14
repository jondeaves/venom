#!/usr/bin/env node
'use strict'

const { readFileSync } = require('fs')
const chalk = require('chalk')

const MAX_LENGTH = 100
const PATTERN = /^(\w*)(\(([\w\$\.\*/-]*)\))?\:? (.*)$/
const TYPES = {
	feat: true,
	fix: true,
	docs: true,
	style: true,
	refactor: true,
	perf: true,
	test: true,
	chore: true,
	revert: true,
	platform: true,
	misc: true,
	Merge: true,
}

const LOG_LEVELS = {
	error: 'red',
	warn: 'yellow',
	info: 'cyan',
	debug: 'white'
}

function log(message, severity) {
	const color = LOG_LEVELS[severity] || 'cyan'
	console.log(chalk[color](message))
}

function validate(message) {
	const [firstLine] = message.split('\n')

	const match = firstLine.match(PATTERN)
	if (!match) {
		log(
			`Message does not match "<type>(<scope>): <subject>"! was: ${message}`,
			'error'
		)
		return false
	}

	const type = match[1]
	if (!TYPES[type]) {
		log(`'${type}' is not an allowed type!`, 'error')
		log(`Valid types are: ${Object.keys(TYPES).join(', ')}`, 'info')
		return false
	}

	if (type !== 'Merge' && firstLine.length >= MAX_LENGTH) {
		log(`Message is longer than ${MAX_LENGTH} characters!`, 'error')
		return false
	}

	return true
}

const commitMessage = readFileSync(
	process.argv[process.argv.length - 1],
	'utf8'
)
const valid = validate(commitMessage)
process.exit(valid ? 0 : 1)
