'use strict'
const {createClient} = require('contentful-management')
const {createReadStream} = require('fs')
const uuidv4 = require('uuid/v4');

const action = async (context) => {
  const client = createClient({accessToken: context.config.get('token')})
  const locale = context.config.get('locale') || 'en-US'
  const filePath = await context.filePath()
  const fileStream = createReadStream(filePath)
  const spaceId = context.config.get('spaceId')
  const environmentId = context.config.get('environmentId') || 'master'

  context.setProgress('Uploading an asset to Contentful...');
  const assetUrl = await uploadAsset(spaceId, environmentId, fileStream) 

  context.copyToClipboard(`${assetUrl}`);
	context.notify(`URL to the ${context.prettyFormat} has been copied to the clipboard`);
}

uploadAsset = (spaceId, environmentId, fileStream) => {
  client.getSpace('<space_id>')
    .then((space) => space.getEnvironment('<environment-id>'))
    .then((environment) => environment.createAssetFromFiles({
      fields: {
        file: {
          'en-US': {
            contentType: 'application/octet-stream',
            fileName: uuidv4(),
            file: fileStream 
          }
        }
      }
    }))
    .then((asset) => asset.url)
}
const contentful = {
  title: 'Upload asset to Contentful',
  formats: ['gif', 'mp4', 'webm', 'apng'],
  action,
  config: {
    token: {
      title: 'Contentful management Token',
      description: 'Contentful content management Token',
      type: 'string',
      required: true
    },
    spaceId: {
      title: 'Space ID',
      description: 'Contentful Space ID',
      type: 'string',
      required: true
    },
    environmentId: {
      title: 'Envrionment ID',
      description: 'Contentful Environment ID [default: master]',
      type: 'string',
      required: false
    },
    locale: {
      title: 'Locale',
      description: 'The locale to use when uploading the asset [default: en-US]',
      type: 'string',
      required: false
    }
  }
}

exports.shareServices = [contentful]
