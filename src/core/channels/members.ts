import * as Collections from '../utils/collections';

/**
 *  @Yahav - Caster.fm Cloud
 *  Overwrite the Members class so we don't store members info locally for scalability
 *  We'll use the Soketi http api for users list
 */

/** Represents a collection of members of a presence channel. */
export default class Members {
  members: any;
  count: number;
  myID: any;
  me: any;

  constructor() {
    this.reset();
  }

  /** Returns member's info for given id.
   *
   * Resulting object containts two fields - id and info.
   *
   * @param {Number} id
   * @return {Object} member's info or null
   */
  get(id: string): any {
    
    return null; // @Yahav:Added

    if (Object.prototype.hasOwnProperty.call(this.members, id)) {
      return {
        id: id,
        info: this.members[id]
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

    this.members = {}; // @Yahav: Added
    //this.members = subscriptionData.presence.hash; // @Yahav: Commented

    this.count = subscriptionData.presence.count;
    this.me = this.get(this.myID);
  }

  /** Adds a new member to the collection. For internal use only. */
  addMember(memberData: any) {
    // @Yahav:Added the following
    this.count++;
    return memberData;
    // @Yahav: Commented the following
    // if (this.get(memberData.user_id) === null) {
    //   this.count++;
    // }
    // this.members[memberData.user_id] = memberData.user_info;
    // return this.get(memberData.user_id);
  }

  /** Adds a member from the collection. For internal use only. */
  removeMember(memberData: any) {
    // @Yahav:Added the following
    this.count--;
    return memberData;
    // @Yahav: Commented the following
    // var member = this.get(memberData.user_id);
    // if (member) {
    //   delete this.members[memberData.user_id];
    //   this.count--;
    // }
    // return member;
  }

  /** Resets the collection to the initial state. For internal use only. */
  reset() {
    this.members = {};
    this.count = 0;
    this.myID = null;
    this.me = null;
  }
}
