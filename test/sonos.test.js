/* eslint-env mocha */
const assert = require('assert')
const sonos = require('../')
const Sonos = sonos.Sonos

describe('Sonos', function () {
  describe('play()', function () {
    it('should generate play command', function (done) {
      var sonos = new Sonos('localhost', 1400)

      sonos.request = function (endpoint, action, body) {
        assert(endpoint === '/MediaRenderer/AVTransport/Control')
        assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#Play"')
        assert(body === '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>')
        done()
      }

      sonos.play()
    })

    it('should accept a uri string', function (done) {
      var sonos = new Sonos('localhost', 1400)

      var actionCounter = 0

      sonos.request = function (endpoint, action, body, _, callback) {
        actionCounter++

        if (actionCounter === 1) {
          assert(endpoint === '/MediaRenderer/AVTransport/Control')
          assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"')
          assert(body === '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</CurrentURI><CurrentURIMetaData></CurrentURIMetaData></u:SetAVTransportURI>')
          callback(null)
        } else if (actionCounter === 2) {
          assert(endpoint === '/MediaRenderer/AVTransport/Control')
          assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#Play"')
          assert(body === '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>')
          done()
        }
      }

      sonos.play('http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3')
    })

    it('should be able to accept an object instead of uri', function (done) {
      var sonos = new Sonos('localhost', 1400)

      var actionCounter = 0

      sonos.request = function (endpoint, action, body, _, callback) {
        actionCounter++

        if (actionCounter === 1) {
          assert(endpoint === '/MediaRenderer/AVTransport/Control')
          assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"')
          assert(body === '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</CurrentURI><CurrentURIMetaData>test</CurrentURIMetaData></u:SetAVTransportURI>')
          callback(null)
        } else if (actionCounter === 2) {
          assert(endpoint === '/MediaRenderer/AVTransport/Control')
          assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#Play"')
          assert(body === '<u:Play xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>')
          done()
        }
      }

      sonos.play({
        uri: 'http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3',
        metadata: 'test'
      })
    })
  })

  describe('queueNext()', function () {
    it('should generate queue command', function (done) {
      var sonos = new Sonos('localhost', 1400)

      sonos.request = function (endpoint, action, body) {
        assert(endpoint === '/MediaRenderer/AVTransport/Control')
        assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"')
        assert(body === '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</CurrentURI><CurrentURIMetaData></CurrentURIMetaData></u:SetAVTransportURI>')
        done()
      }

      sonos.queueNext('http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3', function () {})
    })

    it('should accept object in place of uri', function (done) {
      var sonos = new Sonos('localhost', 1400)

      sonos.request = function (endpoint, action, body) {
        assert(endpoint === '/MediaRenderer/AVTransport/Control')
        assert(action === '"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI"')
        assert(body === '<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><CurrentURI>http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3</CurrentURI><CurrentURIMetaData>&lt;test&gt;&quot;hello&quot;&lt;/test&gt;</CurrentURIMetaData></u:SetAVTransportURI>')
        done()
      }

      sonos.queueNext({
        uri: 'http://livingears.com/music/SceneNotHeard/091909/Do You Mind Kyla.mp3',
        metadata: '<test>"hello"</test>'
      }, function () {})
    })
  })
})

describe('search', function () {
  it('should emit a timeout event when timeout is hit', function (done) {
    setTimeout(function () {
      assert(false, 'Event never fired')
      done()
    }, 100)

    var search = sonos.search({ timeout: 10 }, function (device, model) {})

    search.on('timeout', function () {
      assert(true)
      done()
    })
  })

  it('should not emit a timeout event when no timeout option is passed in', function (done) {
    setTimeout(function () {
      assert(true)
      done()
    }, 10)

    var search = sonos.search(function (device, model) {})

    search.on('timeout', function () {
      assert(false, 'Timeout event should never fire')
      done()
    })
  })

  it('should not emit a timeout event after search is stopped', function (done) {
    var search = sonos.search({ timeout: 10 }, function (device, model) {})

    search.on('timeout', function () {
      assert(false, 'Timeout event should never fire')
      done()
    })
    search.destroy(function () {
      assert(true)
      done()
    })
  })
})
