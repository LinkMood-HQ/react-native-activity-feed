// @flow
import * as React from 'react';
import { buildStylesheet } from '../styles';
import ReactionToggleIcon from './ReactionToggleIcon';
import type {
  BaseActivityResponse,
  BaseReaction,
  ToggleReactionCallbackFunction,
  ToggleChildReactionCallbackFunction,
  StyleSheetLike,
} from '../types';
import { feedClient, chatClient } from '../../../../src/redux/modules/data/saga';
import { buildChannelObject } from '../../../../src/helpers/functions';

type Props = {|
  /** The activity received from Stream that should be liked when pressing the
   * LikeButton. */
  activity: BaseActivityResponse,
    /** The reaction received from Stream that should be liked when pressing the
     * LikeButton. Liking a reaction requires to pass both this field and
     * the `onToggleChildReaction` as well. */
    reaction ?: BaseReaction,
    /** The reactionKind that is used to like, you can for instance set this to
     * `heart`. */
    reactionKind: string,
      /** The function that toggles reactions on activities. */
      onToggleReaction: ToggleReactionCallbackFunction,
        /** The function that toggles reactions on reactions. */
        onToggleChildReaction ?: ToggleChildReactionCallbackFunction,
        /** Styling of the button */
        styles ?: StyleSheetLike,
|};

/**
 * Like button ready to be embedded as Activity footer
 * @example ./examples/LikeButton.md
 */
export default class LikeButton extends React.Component<Props> {
  static defaultProps = {
    reactionKind: 'like',
  };
  _onPress = () => {
    const {
      activity,
      reaction,
      reactionKind,
      onToggleReaction,
      onToggleChildReaction,
      user
    } = this.props;


    if (reaction && onToggleChildReaction) {
      return onToggleChildReaction(reactionKind, reaction, {}, {});
    }

    // feedClient.reactions.add("interested", activity.id,
    //   { text: "Udaya sharma is interested in your plan" },
    //   { targetFeeds: [`notification:${activity.actor.id}`] }
    // );

    const isPlan = activity.planInfo?.channelId != null ? true : false
    // feedClient.feed("notification", activity.actor.id).addActivity({
    //   actor: feedClient.currentUser.id,
    //   object: {
    //     text: `${feedClient.currentUser.name} is interested in your ${isPlan ? 'plan' : 'broadcast'}`,
    //     planId: activity.planInfo?.channelId || undefined
    //   },
    // })
    if(activity.planInfo?.channelId != null) {
      const channelId = activity.planInfo?.channelId;
 
      const isAlreadyInterested = (activity.own_reactions?.interested || []).length > 0;

      chatClient.queryChannels({
        id: channelId 
      }).then(res => {if(res.length === 1) res[0].update({...buildChannelObject(res[0].data)}, { text: `${user} is${isAlreadyInterested ? " no longer" : ""} interested in your plan`})})
    }

    console.log(activity)

    console.log(activity.planInfo)
    return onToggleReaction(reactionKind, activity, {planId: activity.planInfo?.channelId || undefined, text: `is interested in your ${isPlan ? 'plan' : 'broadcast' } "${isPlan ? activity.planInfo?.name : activity.object}"`, activityId: activity.id}, { targetFeeds: [`notification:${activity.actor.id}`]});
  };

  render() {
    const { activity, reaction, reactionKind } = this.props;
    const styles = buildStylesheet('likeButton', this.props.styles);
    let counts, own_reactions;
    if (reaction && this.props.onToggleChildReaction) {
      counts = reaction.children_counts;
      own_reactions = reaction.own_children;
    } else {
      counts = activity.reaction_counts;
      own_reactions = activity.own_reactions;
    }

    return (
      <ReactionToggleIcon
        styles={styles}
        counts={counts}
        own_reactions={own_reactions}
        kind={reactionKind}
        onPress={this._onPress}
        activeIcon={require('../images/icons/heart.png')}
        inactiveIcon={require('../images/icons/heart-outline.png')}
        labelSingle="Interested"
        labelPlural="Interested"
      />
    );
  }
}
