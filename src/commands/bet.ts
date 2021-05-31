import * as Discord from 'discord.js';
import { Client, CommandConfig } from '../types/discord';

import config from '../../config/config';

import User from '../models/user.model';
import { formatMoney } from '../utils/text';
import { UserDoc } from '../types/models';

const cmd: CommandConfig = {
    desc: `Gamble money.`,
    category: `economy`,
    usage: `<amount>`
};

const sendRecordEmbed = async (message: Discord.Message, previousBet: number) => {
    const sEmbed: Discord.MessageEmbed = new Discord.MessageEmbed()
        .setColor(config.colors.green)
        .setAuthor(`New Highest Bet`, message.author.avatarURL())
        .setDescription(`Previous Highscore: **$${formatMoney(previousBet)}**.`)
        .setTimestamp(new Date())
        .setFooter(config.footer);

    return await message.channel.send(sEmbed);
};

const sendBetEmbed = async (message: Discord.Message, bet: number, didWin: boolean, chance: number) => {
    const sEmbed: Discord.MessageEmbed = new Discord.MessageEmbed()
        .setColor(didWin ? config.colors.green : config.colors.red)
        .setAuthor(`Bet`, message.author.avatarURL())
        .setDescription(`You ${didWin ? `won` : `lost`} **$${formatMoney(bet)}**.\nChance: **${Math.round(chance * 100) / 100}%**.`)
        .setTimestamp(new Date())
        .setFooter(config.footer);

    return await message.channel.send(sEmbed);
};

const calcChance = (bet: number) => Math.round((695 / bet) + (695 / Math.sqrt(bet)) * 100) / 100 + 3;

const getHighestBet = async (message: Discord.Message) => {
    const user = await User.findOne({ discordID: message.author.id });
    return message.channel.send(`Your highest bet is **$${formatMoney(user.highscores.bet)}** with a chance of ${calcChance(user.highscores.bet)}.`);
};

const calcBet = (bet: number) => {
    const chance = calcChance(bet);
    const randomNum = Math.random() * 100;

    return randomNum < chance;
};

const run = async (client: Client, message: Discord.Message, args: string[]) => {
    const m = `${message.author} »`;

    const user = await User.findOne({ discordID: message.author.id });
    if (!user) return message.channel.send(`${m} Your account does not exist!`);

    if (args[0] === `high`) return getHighestBet(message);
    if (isNaN(parseInt(args[0]))) return message.channel.send(`${m} Invalid bet amount.`);

    const bet = par
};

export {
    cmd,
    run
};
