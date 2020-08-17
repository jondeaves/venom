import Discord from 'discord.js';
import shortid from 'shortid';

import MongoService from '../../core/services/mongo.service';

import Quote from '../../core/types/Quote';

import Command from './Command';

export default class QuotesCommand extends Command {
  async execute(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    // Get random quote
    if (args.filter((s) => s.trim().length).length === 0) {
      getRandomQuote(message, args, this.dependencies.mongoService);
      return;
    }

    const first = args[0].trim().toLowerCase();

    switch (first) {
      // Search quotes
      case 'search':
        searchQuotes(message, args.slice(1), this.dependencies.mongoService);
        return;

      // Add quote
      case 'add':
      default:
        if (first.startsWith('#')) {
          getSingleQuote(message, args, this.dependencies.mongoService);
        } else {
          addNewQuote(message, args.slice(first === 'add' ? 1 : 0), this.dependencies.mongoService);
        }
    }
  }
}

const clean = (str: string): string => str.replace(/[\t\n|]+/g, ' ').replace(/\s+/g, ' ');
const getQuoteStr = ({ author, quote, shortId }: Quote): string => `"${quote}" - ${author} (#${shortId})`;

async function getRandomQuote(message: Discord.Message, args: string[], mongoService: MongoService): Promise<void> {
  const count = await mongoService.count(message.author.id, 'quotes', {});
  const r = Math.floor(Math.random() * count);
  const q = await mongoService.dbInstance.collection('quotes').find().skip(r).limit(1).toArray();

  if (q.length > 0) {
    const quote: Quote = q[0];
    message.reply(getQuoteStr(quote));
  } else {
    message.reply("This is where I would usually put a quote. I can't remember any, for some reason...");
  }
}

async function searchQuotes(message: Discord.Message, args: string[], mongoService: MongoService): Promise<void> {
  const q = await mongoService.find<Quote>(message.author.id, 'quotes', {
    quote: {
      $regex: `${args.join(' ')}`,
      $options: 'i',
    },
  });

  if (q.length > 0) {
    let responseTxt = '';
    q.forEach((quote) => {
      responseTxt += `\n${getQuoteStr(quote)}`;
    });
    message.reply("Found a few, I'll DM you what I got!");
    message.author.send(`Found ${q.length} quote${q.length !== 1 ? 's' : ''}:\n${responseTxt}`);
  } else {
    message.reply("Sorry, didn't find anything that matches that.");
  }
}

async function addNewQuote(message: Discord.Message, args: string[], mongoService: MongoService): Promise<void> {
  const [authorRaw, ...restRaw] = args;
  const hasAuthor = /<@!\d+>/.test(authorRaw) || authorRaw.startsWith('@');
  const author = hasAuthor ? (authorRaw.startsWith('@') ? authorRaw.slice(1) : authorRaw) : 'Anonymous';

  const differentAuthor = hasAuthor && author !== `<@!${message.author.id}>`;
  const authorName = differentAuthor
    ? authorRaw.startsWith('@')
      ? authorRaw.slice(1)
      : message.mentions.guild.members.cache.find((u) => u.user.id === message.mentions.users.first().id)?.displayName
    : message.member.displayName;
  const quote = (hasAuthor ? restRaw : [authorRaw, ...restRaw]).join(' ');

  const replies = [
    `wow! How inspiring. I'll forever remember this${differentAuthor ? `, ${author}` : ''}.`,
    `are you serious? This is the best quote ever${differentAuthor ? `, ${author}` : ''}!`,
    'OH. MY. GOD. Perfection.',
    'I am putting this on my wall. This is a quote I will hold dear to me always.',
    `is that real? Woah! Hey,${
      differentAuthor ? ` ${author},` : ''
    } did you ever consider writing a book?! This will sell for millions.`,
    clean(`okay, this is spooky. I definitely dreamt of ${!hasAuthor ? 'a person' : differentAuthor ? author : 'you'}
    saying exactly that this week. ${!hasAuthor ? 'Is someone' : differentAuthor ? `Is ${author}` : 'Are you'}
    prying into my subconscious?`),
    'consider me floored. If there was an award for amazing quotes, it would be named after this exact one.',
    'why did no one say this earlier? It HAS to be said!',
    "I can't believe you withold that quote from me until now. It's way too good to just remain unshared!",
    'I have a pretty large memory capacity for a bot, and I gotta say, I scanned all my other quotes, this one is definitely on the top 10.',
    clean(`Oh, I am DEFINITELY saving this. One day someone will interview me about
    ${
      !hasAuthor ? 'the best quote I can recall,' : differentAuthor ? author : 'you'
    } and I will refer to this moment precisely.`),
    clean(`you're not serious. Are you serious? You can't be serious. It's impossible there's **this** good a quote just floating around
    out there. It's probably fictional. Yeah.`),
  ];

  const quoteObj: Quote = {
    quote,
    author,
    shortId: shortid.generate(),
    meta: {
      authorCachedName: authorName,
      createdAt: new Date(),
      createdBy: message.author.id,
      createdByCachedName: message.member.displayName,
    },
  };

  const quoteStr = getQuoteStr(quoteObj);
  mongoService.insert(message.author.id, 'quotes', [quoteObj]);
  message.reply(`${replies[Math.floor(Math.random() * replies.length)]}\n${quoteStr}`);
}

async function getSingleQuote(message: Discord.Message, args: string[], mongoService: MongoService): Promise<void> {
  const id = args[0].slice(1);
  const quote = await mongoService.findOne<Quote>(message.author.id, 'quotes', { shortId: id });

  if (!quote) {
    message.reply("I'm sorry, I couldn't find a quote with that id!");
    return;
  }

  message.reply(getQuoteStr(quote));
}
