import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import StreamFeed from "./StreamFeed";
import channelSelector, { channelById } from '../../selectors/channels';
import { deleteStream, positionStream, updateStream } from '../../requests/streams';
import MonitorRightbar from "../TwitterBooster/Sections/MonitorRightbar";
import getSocialMediaCards from '../../config/socialmediacards';
import { addStream } from '../../requests/streams';
import Modal from 'react-modal';
import AutoCompleteSearch from '../AutoCompleteSearch';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 10;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  margin: `0px ${grid * 2}px 0px 0px`,
  width: `500px`,
  minWidth: `356px`,
  maxWidth: `356px`,
  height: `auto`,
  outline: `none`,
  borderRadius: '6px',

  // change background colour if dragging
  background: isDragging ? '#f1f1f1' : '#f1f1f1',
  boxShadow: '0px 1px 3px 0px #c5c5c5',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getTitleStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  background: isDragging ? 'lightgreen' : '#EAF3FB',
  paddingLeft: '25px',
  paddingRight: '30px',

  // styles we need to apply on draggables
  //...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : '#F5F7FB',
  display: 'flex',
  padding: `${grid}px 0px`,
  overflow: 'auto'
});

const ACCOUNT_SELECTOR_FILTERS = {
  'facebook': (account) => account.details.account_type !== 'profile'
};

class StreamItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.streams.length ? this.props.streams : [],
      currentItemId: "",
      titleText: "",
      refresh: false,
      loading: false,
      searchModal: false,
      autoCompleteSearchModal: false,
      searchTerm: "",
      socialMediaCards: getSocialMediaCards(),

      selectedAccount: Object.entries(this.props.selectedChannel).length ?
        { label: <ProfileChannel channel={this.props.selectedChannel} />, value: this.props.selectedChannel.name, type: this.props.selectedChannel.type, id: this.props.selectedChannel.id } :
        (this.props.channels.length ?
          { label: <ProfileChannel channel={this.props.channels[0]} />, value: this.props.channels[0].name, type: this.props.channels[0].type, id: this.props.channels[0].id } : {}),

      selectedSocial: '',
      selectedAccountId: '',
      socialMediasSelectorOptions: [],
      streamIcons: [],
      selectedAvatar: '',

    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }
  
  //Function to set initial state values
  componentWillMount() {
    let socialMediaCards = getSocialMediaCards();
    let selectedSocial = this.props.selectedSocial;
    let selectedAccountId = this.props.selectedAccountId;
    
    this.setState({ selectedSocial: selectedSocial });
    this.setState({ selectedAccountId: selectedAccountId });
    this.setState({ streamIcons: this.getIcons(socialMediaCards, selectedSocial) });

    const accountSelectorOptions = this.getAccountSelectorOptions(selectedSocial);    
    let selectedAccount = accountSelectorOptions.find((item) => item.id === selectedAccountId);
    this.setState({ selectedAccount: selectedAccount });
    this.setState({ selectedAvatar: selectedAccount.avatar });
    
    this.props.channels.forEach(({ type, id }) => {
      // Getting the options for the socialMedia dropdown
      if (this.state.socialMediasSelectorOptions.indexOf(type) === -1) {
        this.state.socialMediasSelectorOptions.push(type);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.streams !== prevProps.streams) {
      this.setState(() => ({
        items: this.props.streams.length ? this.props.streams : []
      }));
    }
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items,
    }, () => positionStream(result.draggableId, items));
  }

  handleStreamClose = (currentItem) => {
    this.setState(() => ({
      items: this.state.items.filter(item => item !== currentItem)
    }), () => deleteStream(currentItem.id));
  }

  handleTitleChange = (e) => {
    let val = e.target.value;

    this.setState(() => ({
      titleText: val
    }));
  }

  refresh = (id = false) => {
    this.setState(() => ({
      refresh: id,
      loading: id ? id : this.state.loading
    }));
  };

  loading = (id = false) => {
    this.setState(() => ({
      loading: id
    }));
  };

  handleTitleChangeSubmit = () => {
    document.removeEventListener('click', this.handleOutsideClick, false);
    const currentItemId = this.state.currentItemId;
    const titleText = this.state.titleText;
    this.setState(() => ({
      items: this.state.items.map(item => {
        if (item.id === currentItemId) {
          item.title = titleText;
        }
        return item;
      }),
      currentItemId: "",
      titleText: ""
    }), () => updateStream(currentItemId, titleText));
  }

  handleTitleClick = (e) => {
    document.addEventListener('click', this.handleOutsideClick, false);
    let item = { id: "", title: "" };

    if (item = e.target.getAttribute('data-editable-item')) {
      item = JSON.parse(item);
      this.setState(() => ({
        currentItemId: item.id,
        titleText: item.title
      }));
      return;
    }
  }

  handleOutsideClick = (e) => {
    // ignore clicks on the component itself
    if (typeof e === "undefined") return;

    if (e.target.getAttribute('data-editable')) return;

    let item = { id: "", title: "" };

    if (item = e.target.getAttribute('data-editable-item')) {
      item = JSON.parse(item);
      this.setState(() => ({
        currentItemId: item.id,
        titleText: item.title
      }));
      return;
    }

    this.handleTitleChangeSubmit();
  };

  handleKeyDown = (e) => {

    if (e.key === "Enter") {
      this.handleTitleChangeSubmit();
    }
  }

  submitStream = (item) => {

    this.setState(() => ({
      loading: true
    }));

    const channelId = this.state.selectedAccount.id;
    const network = this.state.selectedAccount.type;
    const selectedTab = this.props.selectedTab;
    const searchTerm = this.state.searchTerm;

    return addStream(item, channelId, selectedTab, network, searchTerm).then(() => this.props.reload()).then(() => {
      if (typeof this.props.close !== "undefined") this.props.close();
    });
  };

  //Function to change social icons by social type
  onChangeSocial = (value) => {
    
    this.setState({ selectedSocial: value });
    
    const accountSelectorOptions = this.getAccountSelectorOptions(value);
    let selectedAccountId = accountSelectorOptions[0].id;
    this.setState({ selectedAccountId: selectedAccountId });

    let selectedAccount = accountSelectorOptions.find((item) => item.id === selectedAccountId);
    this.setState({ selectedAccount: selectedAccount });
    this.setState({ selectedAvatar: selectedAccount.avatar });
 
    let socialMediaCards = this.state.socialMediaCards;
    let streamIcons = this.getIcons(socialMediaCards, value);
    this.setState({streamIcons: streamIcons});    
  };

  onClickCreator = (item) => {
 
    let input;
    if(item.value == 'search' || item.value == 'pages'){
      input = {label: 'Search Keywords', value: 'keywords'};
      this.handleTypeClick(input);
      return;
    } else {
      this.handleTypeClick(item);
    }
  }

  handleTypeClick = (item) => {
    const {selectedAccount} = this.state;
    let input = item;
    if(item.value === "keywords"){
      if(selectedAccount.type == "facebook"){
        this.toggleAutoCompleteSearchModal();
        return;
      }else if(selectedAccount.type == "twitter"){
        this.toggleSearchModal();
        return;
      }
    }  

    this.submitStream(input);
  }

  handleSearchInputChange = (event) => {
    try {
        const value = event.target.value;
        this.setState(() => (
            { searchTerm: value }
        ));
    } catch (e) { }
  }

  toggleSearchModal = () => {
    this.setState(() => ({
        searchModal: !this.state.searchModal
    }), () => {
        if (!this.state.searchModal && this.state.searchTerm !== "") {
            this.submitStream({ label: "Search", value: "search", icon: "search" });
        }
    });
  };

  toggleAutoCompleteSearchModal = () => {
    this.setState(() => ({
        autoCompleteSearchModal: !this.state.autoCompleteSearchModal
    }), () => {
        if (!this.state.autoCompleteSearchModal && this.state.searchTerm !== "") {
            this.submitStream({ label: "Pages", value: "pages", icon: "flag" });
        }
    });
  };

  setAutoCompleteSelected = (value) => {
    this.setState(() => ({
        searchTerm: value
    }));
  };

  onAccountChange = (value) => {
    this.setState({ selectedAccountId: value });

    let selectedAccount = this.props.channels.find((item) => item.id === value);
    if (selectedAccount) {
      this.setState({ selectedAccount: selectedAccount });
      this.setState({ selectedAvatar: selectedAccount.avatar });
    }
  };

  getAccountSelectorOptions = (selectedSocial) => {
    const { channels } = this.props;
    const socialMediaFilter = ACCOUNT_SELECTOR_FILTERS[selectedSocial];
    let options = channels.filter((account => account.type === selectedSocial));
    if (socialMediaFilter) {
      options = options.filter(socialMediaFilter);
    }
    return options;
  };
  
  //Function to get Iconsn by selectedSocial
  getIcons = (socialMediaCards, selectedSocial) => {
    switch (selectedSocial) {
      case 'twitter':
        return socialMediaCards.twitterIcons;        
      case 'facebook':        
        return socialMediaCards.facebookIcons;
      case 'linkedin':
        return socialMediaCards.linkedinIcons;
      default:
        return [];
    }
  }

  render() {
    const { channels, refreshRate, selectedTab, reload, isStreamMakerOpen } = this.props;
    const { socialMediasSelectorOptions, selectedSocial, streamIcons, selectedAvatar, selectedAccountId } = this.state;
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {this.state.items.map((item, index) => {
                const channel = channelById(channels, { id: item.channel_id });
                return (
                  channel && <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >

                        <h3 style={getTitleStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )} className={`stream-title`}>
                          <img className="image-size" 
                            src={item.type == "search" || item.type == "pages" ? "/images/monitor-icons/searchresult.svg" 
                            :
                            `/images/monitor-icons/${item.type}.svg`}/>
                          <span className="stream-user">{item.network == "twitter" ? "@" + channel.username : "@" + channel.name}</span>
                          <div className="pull-right">
                            <img className={`action-btn stream-refresh-btn ${this.state.loading === item.id ? 'fa-spin' : ''}`} src="/images/monitor-icons/refresh.svg" onClick={() => this.refresh(item.id)} />
                            <img className="action-btn stream-close-btn" src="/images/monitor-icons/close.svg" onClick={() => this.handleStreamClose(item)} />
                          </div>
                        </h3>

                        <StreamFeed
                          streamItem={item}
                          channel={channel}
                          reload={reload}
                          selectedTab={selectedTab}
                          refreshId={this.state.refresh}
                          resetRefresh={this.refresh}
                          refreshRate={refreshRate}
                          resetLoading={this.loading} />
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
              <Modal isOpen={!!this.state.searchModal} ariaHideApp={false} className="stream-type-modal search-modal">
                <div>
                    <input type="text" onChange={e => this.handleSearchInputChange(e)} value={this.state.searchTerm} placeholder="Example: coca cola or #fashion" />
                    <button onClick={this.toggleSearchModal} className="publish-btn-group gradient-background-teal-blue link-cursor">Done</button>
                </div>
              </Modal>

              <Modal isOpen={!!this.state.autoCompleteSearchModal} ariaHideApp={false} className="stream-type-modal search-modal">
                  <div>
                      <AutoCompleteSearch placeholder="Type a page name..." channelId={selectedAccountId} setSelected={this.setAutoCompleteSelected} />
                      <button onClick={this.toggleAutoCompleteSearchModal} className="publish-btn-group autocomplete-done gradient-background-teal-blue link-cursor">Done</button>
                  </div>
              </Modal>
              {
                isStreamMakerOpen && <MonitorRightbar
                  socialNetWorks={socialMediasSelectorOptions}
                  selectedSocial={selectedSocial}
                  creators={streamIcons}
                  onChangeSocial={(val) => this.onChangeSocial(val)}
                  onClickCreator={this.onClickCreator}
                  selectedAvatar={selectedAvatar}
                  selectedAccountId={selectedAccountId}
                  onAccountChange={(value) => this.onAccountChange(value)}
                  accounts={this.getAccountSelectorOptions(selectedSocial)}

                />
              }
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}
const ProfileChannel = ({ channel }) => (
  <div className="channel-container">
    <div className="profile-info pull-right">
      <span className="pull-left profile-img-container">
        <img src={channel.avatar} />
        <i className={`fa fa-${channel.type} ${channel.type}_bg smallIcon`}></i>
      </span>
      <div className="pull-left"><p className="profile-name" title={channel.name}>{channel.name}</p>
        <p className="profile-username">{channel.username !== null ? "@" + channel.username : ""}</p>
      </div>
    </div>
  </div>
);

const mapStateToProps = (state) => {
  const channels = channelSelector(state.channels.list, { selected: undefined, provider: undefined, publishable: true });
  const selectedChannel = channelSelector(channels, { selected: 1 });

  return {
    channels,
    selectedChannel: selectedChannel.length ? selectedChannel[0] : {},
  }
}

export default connect(mapStateToProps)(StreamItems);
