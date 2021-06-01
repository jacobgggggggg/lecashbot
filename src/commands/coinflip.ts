import * as Discord from 'discord.js';
import { Client, CommandConfig } from '../types/discord';

import config from '../../config/config';
import User from '../models/user.model';

import { formatMoney } from '../utils/text';
import log from '../utils/log';

const cmd: CommandConfig = {
    desc: `Flip a coin for money.`,
    category: `economy`,
    usage: `<amount>`
};

const calcCost = (coinflipStreak: number) => coinflipStreak ? Math.round(100 * (2 ^ coinflipStreak)) : 0;
const calcReward = (coinflipStreak: number) => Math.round(100 * (3 ^ (coinflipStreak - 1)) + (coinflipStreak * 150));

const sendReward = (message: Discord.Message, user: any, embed: Discord.MessageEmbed, recordEmbed: Discord.MessageEmbed) => {
    const cost = calcCost(user.streaks.coinflip);
    const reward = calcReward(user.streaks.coinflip);

    const streakChance = Math.round((100 / (2 ^ (user.streaks.coinflip + 1))) * 100) / 100;
    const profit = reward - cost;

    if (user.balance < cost) {
        embed.setColor(config.colors.orange);
        embed.setDescription(`You do not have enough money to coinflip!`);
        return message.channel.send(embed);
    }

    log(`blue`, `${message.author.tag} [${message.author.id}] coinflipped with a streak of ${user.streaks.coinflip} and won.`);

    const nextCost = 100 * (2 ^ (user.streaks.coinflip + 1));
    const nextReward = 100 * (3 ^ user.streaks.coinflip) + ((user.streaks.coinflip + 1) * 150);

    const description = {
        reward: `**${message.author.username}** just earned **$${formatMoney(reward)}**.`,
        streak: `with a streak of **${user.streaks.coinflip + 1}!`,
        chance: `The chances of winning this is **${streakChance}%**!`,
        nextCostMsg: `Your next coinflip will cost **$${formatMoney(nextCost)}**.`,
        nextRewardMsg: `If you win it, you will win **$${formatMoney(nextReward)}**.`
    };

    const embedDesc = `${description.reward} ${description.streak}\n${description.chance}\n\n${description.nextCostMsg}\n${description.nextRewardMsg}`;

    if (user.streaks.coinflip + 1 > user.highscores.coinflip) {
        User.updateOne({ discordID: message.author.id }, { [`highscores/coinflip`]: user.streaks.coinflip + 1 });

        recordEmbed.setDescription(`New highest coinflip streak of **${user.streaks.coinflip}`);
        message.channel.send(recordEmbed);
    }

    User.updateOne({ discordID: message.author.id }, { balance: user.balance + profit, [`streaks/coinflip`]: user.streaks.coinflip + 1 },)

    embed.setColor(config.colors.green).setDescription(embedDesc);
    message.channel.send(embed);
};

const run = async (client: Client, message: Discord.Message, args: string[]) => {
    const m = `${message.author} »`;
};

export {
    cmd,
    run
};
