import React from 'react';
import { connect } from 'react-redux';
import VerticalMenu from './Menus/VerticalMenu';
import getMenuItems from '../config/menuItems';
import ManageRouter from '../routes/ManageRouter';
import channelSelector from '../selectors/channels';
import { setTwitterChannel } from '../actions/channels';
import SocialAccountsPrompt from './SocialAccountsPrompt';

const MasterPage = ({channels, selectedChannel, selectChannel}) => { 
    const hasChannel = typeof(selectedChannel.username) !== 'undefined'; 
    return (
      <div className="body-wrap">
          {!!hasChannel ? 
            <div>
              <VerticalMenu 
                menuItems={getMenuItems(selectedChannel.type)} 
                channels={channels} 
                selectedChannel={selectedChannel}
                selectChannel={selectChannel}
              />
              <div className="body-container">
                <div className="main-section">
                  <ManageRouter/>
                </div>
              </div>
            </div> :
            <div className="mt100">
              <SocialAccountsPrompt 
                image = "/images/connect_twitter_accounts.svg"
                title = "Prove the impact of your social media initiatives"
                description = "Track your social growth, and get meaningful stats"
                buttonTitle = "Connect your Twitter Account"
                buttonLink = "/accounts/twitter"
              />
            </div>
          }

      </div>  
    );
};

const mapStateToProps = (state) => {
  const unselectedGlobalChannels = { selected: 0, provider: undefined };
  const selectedGlobalChannel = { selected: 1, provider: undefined };

  const channels = channelSelector(state.channels.list, unselectedGlobalChannels);
  const selectedChannel = channelSelector(state.channels.list, selectedGlobalChannel);

  return {
    channels,
    selectedChannel: selectedChannel.length ? selectedChannel[0] : {}
  };
};

const mapDispatchToProps = (dispatch) => ({
  selectChannel: (id) => dispatch(setTwitterChannel(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(MasterPage);