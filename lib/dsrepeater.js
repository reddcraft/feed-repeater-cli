const web3 = require('../web3');
const DSFeeds = require('./js_module');

module.exports = (address, env) => {
  DSFeeds.environments[env].feeds.value = address;
  DSFeeds.class(web3, env);
  const toString = x => web3.toAscii(x).replace(/\0/g, '');

  const feeds = DSFeeds.objects.feeds;

  feeds.inspect = (id) => {
    const owner = feeds.owner(id);
    if (owner === '0x0000000000000000000000000000000000000000') {
      return 'Feed not claimed';
    }

    const peek = feeds.peek.call(id);
    let value = '';
    if (peek) {
      value = feeds.read.call(id);
    }

    const result = {
      id: web3.toDecimal(id),
      owner,
      label: toString(feeds.label(id)),
      available: peek,
      value: value === '' ? '' : web3.toDecimal(value),
      min: web3.toDecimal(feeds.min(id)),
      feedsQuantity: web3.toDecimal(feeds.feedsQuantity(id))
    };
    return result;
  };

  feeds.filter = (options, callback) => {
    web3.eth.filter(Object.assign({
      address,
    }, options), (error, event) => {
      if (error) {
        callback(error);
      } else if (!event || !event.topics) {
        callback(new Error(`Bad event: ${event}`));
      } else {
        // callback(null, web3.toDecimal(event.topics[1]));
        callback(null, event.topics[1]);
      }
    });
  };
  return feeds;
};
