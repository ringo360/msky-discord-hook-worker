export default {

  async fetch(request, env) {

    //DiscordのユーザーID
    const discordid = '1063527758292070591'

    if (request.headers.get('X-Misskey-Hook-Secret') !== env.SECRET) {
      console.log('wrong secret');
      return new Response('wrong secret');
    }

    const reqBody = await request.text();
    if (!reqBody) {
      console.log('no body');
      return new Response('no body - 帰りなさい');
    }

    const body = JSON.parse(reqBody);
    console.log('New request!')
    console.log(body)
    console.log(`TYPE: ${body.type}`)

    if (body.type !== 'followed' && body.type !== 'mention' && body.type !== 'reply' && !body.body.note.renote) {
      console.log(`Wrong type!`)
      console.log(body.type)
      return new Response('Wrong type - 帰りなさい');
    }
    let note;
    let user;
    let username;

    if (body.type == 'mention') {
      console.log('New mention')
      note = body.body.note
      if (note.renoteId) {
        console.log('Ignore')
        return new Response('ignored')
      }
      if (note.replyId) {
        console.log('Ignore')
        return new Response('ignored')
      }
      user = note.user
      username = user.host ? `${user.username}@${user.host}` : user.username;
      const result = await sendtoDC(env.DISCORD, `<@${discordid}>\n${username}にメンションされました!\n${note.text}`);
      return new Response(result);
    }

    if (body.type == 'reply') {
      console.log('New Reply')
      note = body.body.note
      user = note.user
      username = user.host ? `${user.username}@${user.host}` : user.username;
      const result = await sendtoDC(env.DISCORD, `<@${discordid}>\n${username}にリプライされました!\n${note.text}`);
      return new Response(result);
    }

    if (body.type == 'followed') {
      console.log('New Follower')
      user = body.body.user
      username = user.host ? `${user.username}@${user.host}` : user.username;
      const result = await sendtoDC(env.DISCORD, `<@${discordid}>\n${username}にフォローされました!`);
      return new Response(result);
    }

    if (body.body.note.renote) {
        console.log('New Renote')
        note = body.body.note
        user = note.user
        username = user.host ? `${user.username}@${user.host}` : user.username;
        const result = await sendtoDC(env.DISCORD, `<@${discordid}>\n${username}にリノートされました!${note.text ? `\n${note.text}` : ''}`);
        return new Response(result);
    }
  },
};

async function sendtoDC(url, msg) {
  // POSTリクエストを送り付ける
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: msg
    })
  })
  .then((res) => res.ok)
  return response ? 'ok' : 'error'
  
}
