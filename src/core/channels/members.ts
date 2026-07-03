import * as Collections from '../utils/collections';

/**
 *  @Yahav - Caster.fm Cloud
 *  Overwrite the Members class so we don't store members info locally for scalability
 *  We'll use the Soketi http api for users list.
 *
 *  This behavior is applied ONLY to channels whose name (after the mandatory
 *  "presence-" prefix) starts with "Admin." or "Website.". All other presence
 *  channels keep the original upstream behavior.
 */

/** Represents a collection of members of a presence channel. */
export default class Members {
  members: any;
  count: number;
  myID: any;
  me: any;
  channelName?: string; // @Yahav: Added — used to scope the custom behavior

  constructor(channelName?: string) {
    this.channelName = channelName; // @Yahav: Added
    this.reset();
  }

  /** @Yahav: Added — true when this channel should use the scalable (no local
   * storage) behavior, i.e. name after "presence-" starts with "Admin."/"Website.". */
  private useScalableBehavior(): boolean {
    const channelName = this.channelName || '';
    const channelNameWithoutPrefix =
      channelName.indexOf('presence-') === 0
        ? channelName.slice('presence-'.length)
        : channelName;
    return (
      channelNameWithoutPrefix.indexOf('Admin.') === 0 ||
      channelNameWithoutPrefix.indexOf('Website.') === 0
    );
  }

  /** Returns member's info for given id.
   *
   * Resulting object containts two fields - id and info.
   *
   * @param {Number} id
   * @return {Object} member's info or null
   */
  get(id: string): any {
    if (this.useScalableBehavior()) {
      return null; // @Yahav: no local member store for Admin./Website. channels
    }

    if (Object.prototype.hasOwnProperty.call(this.members, id)) {
      return {
        id: id,
        info: this.members[id],
      };
    } else {
      return null;
    }
  }

  /** Calls back for each member in unspecified order.
   *
   * @param  {Function} callback
   */
  each(callback: Function) {
    Collections.objectApply(this.members, (member, id) => {
      callback(this.get(id));
    });
  }

  /** Updates the id for connected member. For internal use only. */
  setMyID(id: string) {
    this.myID = id;
  }

  /** Handles subscription data. For internal use only. */
  onSubscription(subscriptionData: any) {
    // @Yahav: skip storing the members hash for Admin./Website. channels
    this.members = this.useScalableBehavior()
      ? {}
      : subscriptionData.presence.hash;
    this.count = subscriptionData.presence.count;
    this.me = this.get(this.myID);
  }

  /** Adds a new member to the collection. For internal use only. */
  addMember(memberData: any) {
    if (this.useScalableBehavior()) {
      // @Yahav: don't store info locally — just track the count
      this.count++;
      return memberData;
    }

    if (this.get(memberData.user_id) === null) {
      this.count++;
    }
    this.members[memberData.user_id] = memberData.user_info;
    return this.get(memberData.user_id);
  }

  /** Adds a member from the collection. For internal use only. */
  removeMember(memberData: any) {
    if (this.useScalableBehavior()) {
      // @Yahav: no local store to delete from — just track the count
      this.count--;
      return memberData;
    }

    var member = this.get(memberData.user_id);
    if (member) {
      delete this.members[memberData.user_id];
      this.count--;
    }
    return member;
  }

  /** Resets the collection to the initial state. For internal use only. */
  reset() {
    this.members = {};
    this.count = 0;
    this.myID = null;
    this.me = null;
  }
}
