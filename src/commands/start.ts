import { MyContext } from "../bot";

export async function start(ctx: MyContext) {
  ctx.session.nombre = ctx.from?.first_name ?? ''
  await ctx.reply(ctx.t('welcome', {name: ctx.session.nombre}));
  
}

