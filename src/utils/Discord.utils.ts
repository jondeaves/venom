import Discord from 'discord.js';
import { forceArray } from './Utils';

export function hasRoleByName(
  roleNames: string | string[],
  messageOrMember: Discord.Message | Discord.GuildMember,
): boolean {
  const roles = new Set(forceArray(roleNames));
  const member = isMessage(messageOrMember) ? messageOrMember.member : messageOrMember;
  return member.roles.cache.some((r) => roles.has(r.name));
}

export function hasRoleByID(
  roleNames: string | string[],
  messageOrMember: Discord.Message | Discord.GuildMember,
): boolean {
  const roles = forceArray(roleNames);
  const member = isMessage(messageOrMember) ? messageOrMember.member : messageOrMember;
  return roles.some((role) => member.roles.cache.has(role));
}

export function isMessage(object: unknown): object is Discord.Message {
  return object.hasOwnProperty('member');
}
