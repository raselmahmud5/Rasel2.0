const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "admin",
        version: "1.7",
        author: "Rasel Mahmud",
        countDown: 5,
        role: 2,
        description: {
            vi: "Thêm, xóa, sửa quyền admin",
            en: "👑 Add, remove, edit admin role"
        },
        category: "box chat",
        guide: {
            en: "   {pn} add <uid | @tag | reply> : 👑 Add admin\n" +
                 "   {pn} remove <uid | @tag | reply> : ❌ Remove admin\n" +
                 "   {pn} list : 📜 Show admin list"
        }
    },

    langs: {
        en: {
            added: "╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n✅ 𝐀𝐃𝐌𝐈𝐍 𝐀𝐃𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘\n╚═══════════════════╝\n\n👑 𝗡𝗲𝘄 𝗔𝗱𝗺𝗶𝗻(𝘀): %1\n\n%2",
            alreadyAdmin: "\n⚠️ 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗔𝗱𝗺𝗶𝗻(𝘀): %1\n\n%2",
            missingIdAdd: "╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n❌ 𝗘𝗥𝗥𝗢𝗥\n╚═══════════════════╝\n\n⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗺𝗲𝗻𝘁𝗶𝗼𝗻, 𝗿𝗲𝗽𝗹𝘆 𝗼𝗿 𝗲𝗻𝘁𝗲𝗿 𝗨𝗜𝗗 𝘁𝗼 𝗮𝗱𝗱 𝗮𝗱𝗺𝗶𝗻",
            removed: "╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n✅ 𝐀𝐃𝐌𝐈𝐍 𝐑𝐄𝐌𝐎𝐕𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘\n╚═══════════════════╝\n\n❌ 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 𝗔𝗱𝗺𝗶𝗻(𝘀): %1\n\n%2",
            notAdmin: "\n⚠️ 𝗡𝗼𝘁 𝗔𝗱𝗺𝗶𝗻(𝘀): %1\n\n%2",
            missingIdRemove: "╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n❌ 𝗘𝗥𝗥𝗢𝗥\n╚═══════════════════╝\n\n⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗺𝗲𝗻𝘁𝗶𝗼𝗻, 𝗿𝗲𝗽𝗹𝘆 𝗼𝗿 𝗲𝗻𝘁𝗲𝗿 𝗨𝗜𝗗 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲 𝗮𝗱𝗺𝗶𝗻",
            listAdmin: "╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n👑 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓\n╚═══════════════════╝\n\n%1\n\n╔═══════════════════╗\n║ 𝗔𝘂𝗱𝗶𝘁𝗼𝗿: 𝐑𝐚𝐬𝐞𝐥 𝐌𝐚𝐡𝐦𝐮𝐝  ║\n╚═══════════════════╝"
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {
        const command = args[0]?.toLowerCase();

        switch (command) {
            case "add":
            case "-a": {
                let uids = [];
                
                // Reply থেকে UID নেওয়া
                if (event.messageReply) {
                    uids.push(event.messageReply.senderID);
                }
                // Mention থেকে UID নেওয়া
                else if (Object.keys(event.mentions).length > 0) {
                    uids = Object.keys(event.mentions);
                }
                // Args থেকে UID নেওয়া
                else if (args[1]) {
                    uids = args.slice(1).filter(arg => !isNaN(arg));
                }
                else {
                    return message.reply(getLang("missingIdAdd"));
                }

                if (uids.length === 0) {
                    return message.reply(getLang("missingIdAdd"));
                }

                const notAdminIds = [];
                const adminIds = [];
                
                for (const uid of uids) {
                    if (config.adminBot.includes(uid))
                        adminIds.push(uid);
                    else
                        notAdminIds.push(uid);
                }

                config.adminBot.push(...notAdminIds);
                const getNames = await Promise.all(uids.map(uid => 
                    usersData.getName(uid).then(name => ({ uid, name }))
                ));
                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                let msg = "";
                if (notAdminIds.length > 0) {
                    const newAdmins = getNames
                        .filter(u => notAdminIds.includes(u.uid))
                        .map(u => `▸ 👤 ${u.name}\n  └─ 🆔 ${u.uid}`)
                        .join("\n\n");
                    msg += getLang("added", notAdminIds.length, newAdmins);
                }
                if (adminIds.length > 0) {
                    const existingAdmins = getNames
                        .filter(u => adminIds.includes(u.uid))
                        .map(u => `▸ 👤 ${u.name}\n  └─ 🆔 ${u.uid}`)
                        .join("\n\n");
                    msg += getLang("alreadyAdmin", adminIds.length, existingAdmins);
                }
                
                return message.reply(msg);
            }

            case "remove":
            case "-r": {
                let uids = [];
                
                // Reply থেকে UID নেওয়া
                if (event.messageReply) {
                    uids.push(event.messageReply.senderID);
                }
                // Mention থেকে UID নেওয়া
                else if (Object.keys(event.mentions).length > 0) {
                    uids = Object.keys(event.mentions);
                }
                // Args থেকে UID নেওয়া
                else if (args[1]) {
                    uids = args.slice(1).filter(arg => !isNaN(arg));
                }
                else {
                    return message.reply(getLang("missingIdRemove"));
                }

                if (uids.length === 0) {
                    return message.reply(getLang("missingIdRemove"));
                }

                const notAdminIds = [];
                const adminIds = [];
                
                for (const uid of uids) {
                    if (config.adminBot.includes(uid))
                        adminIds.push(uid);
                    else
                        notAdminIds.push(uid);
                }

                for (const uid of adminIds)
                    config.adminBot.splice(config.adminBot.indexOf(uid), 1);

                const getNames = await Promise.all(uids.map(uid => 
                    usersData.getName(uid).then(name => ({ uid, name }))
                ));
                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

                let msg = "";
                if (adminIds.length > 0) {
                    const removedAdmins = getNames
                        .filter(u => adminIds.includes(u.uid))
                        .map(u => `▸ 👤 ${u.name}\n  └─ 🆔 ${u.uid}`)
                        .join("\n\n");
                    msg += getLang("removed", adminIds.length, removedAdmins);
                }
                if (notAdminIds.length > 0) {
                    const nonAdmins = getNames
                        .filter(u => notAdminIds.includes(u.uid))
                        .map(u => `▸ 👤 ${u.name}\n  └─ 🆔 ${u.uid}`)
                        .join("\n\n");
                    msg += getLang("notAdmin", notAdminIds.length, nonAdmins);
                }

                return message.reply(msg);
            }

            case "list":
            case "-l": {
                if (config.adminBot.length === 0) {
                    return message.reply("╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n📜 𝐀𝐃𝐌𝐈𝐍 𝐋𝐈𝐒𝐓\n╚═══════════════════╝\n\n⚠️ 𝗡𝗼 𝗮𝗱𝗺𝗶𝗻𝘀 𝗳𝗼𝘂𝗻𝗱!\n\n╔═══════════════════╗\n║ 𝗔𝘂𝗱𝗶𝘁𝗼𝗿: 𝐑𝐚𝐬𝐞𝐥 𝐌𝐚𝐡𝐦𝐮𝐝  ║\n╚═══════════════════╝");
                }

                const getNames = await Promise.all(
                    config.adminBot.map(uid => 
                        usersData.getName(uid).then(name => ({ uid, name }))
                    )
                );

                const adminList = getNames
                    .map((u, i) => `${i + 1}. 👑 ${u.name}\n   └─ 🆔 ${u.uid}`)
                    .join("\n\n");

                return message.reply(getLang("listAdmin", adminList));
            }

            default:
                return message.reply(
                    "╔═════❰ 𝐇𝐞𝐈𝐢•𝗟𝗨𝗠𝗢 ❱═════╗\n👑 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒\n╚═══════════════════╝\n\n" +
                    "📌 /admin add <mention/reply/uid>\n" +
                    "📌 /admin remove <mention/reply/uid>\n" +
                    "📌 /admin list\n\n" +
                    "╔═══════════════════╗\n║ 𝗔𝘂𝗱𝗶𝘁𝗼𝗿: 𝐑𝐚𝐬𝐞𝐥 𝐌𝐚𝐡𝐦𝐮𝐝  ║\n╚═══════════════════╝"
                );
        }
    }
};
