import { User } from '../models/user.model';
import { MessageEmbed } from 'discord.js';
import { colors, version } from '../config/config';
import { currency, int } from '../utils/format';

const sendSuccessEmbed = (msg, err) => {
    const successEmbed = new MessageEmbed()
        .setColor(err ? colors.red : colors.green)
        .setAuthor(`${err ? `Error` : `Success!`}`, msg.author.avatarURL())
        .setTimestamp(new Date())
        .setFooter(`LeCashBot v${version}`);

    if (err) {
        successEmbed.setDescription(`An error occurred.`);
    }

    msg.channel.send(successEmbed);
};

export default async (msg, client, args) => {
    if (!args[0]) return msg.reply(`No user given.`);

    const id = args[0].replace(/<|@|!|>/g, ``);
    const isNotId = (isNaN(parseInt(id)));
    const receiverId = (isNotId) ? { name: args[0] } : { discordId: id };
    const userId = { discordId: msg.author.id };
    const receiver = await User.findOne(receiverId);
    const user = await User.findOne(userId);

    if (userId.discordId === receiverId.discordId) return msg.reply(`You can't gift yourself!`);
    if (!args[1] || isNaN(int(args[1]))) return msg.reply(`No amount given.`);
    if (!user || !receiver) return msg.reply(`User not found!`);
    if (parseInt(args[1]) < 100) return msg.reply(`Minimum gift amount is $**1000000000**.`);

    const userBal = user.balance;
    const gift = int(args[1]);

    if (userBal < gift) {
        return msg.reply(`You do not have enough in your balance: $**${currency(user.balance)}**`);
    }

    User.updateOne(receiverId, { balance: receiver.balance + gift }, err => {
        if (err) sendSuccessEmbed(msg, err);
    });
    User.updateOne(userId, { balance: userBal - gift }, err => sendSuccessEmbed(msg, err));

    client.logger.ready(`${user.name} (${user.discordId}) gave ${receiver.name} (${receiver.discordId}) $${gift}.`);

    return client.users.cache
        .get(receiverId.discordId)
        .send(`**${user.name}** just sent you $**${gift}**!`);
};
