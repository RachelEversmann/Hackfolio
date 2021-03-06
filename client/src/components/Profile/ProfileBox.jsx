/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/require-default-props */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-did-mount-set-state */
import React from 'react';
import { connect } from 'react-redux';
/* import PropTypes from 'prop-types'; */

// Grommet Components
import {
  Card,
  Box,
  Heading,
  Tile,
  Image,
  Anchor,
} from 'grommet';

// Grommet Icons
import EditIcon from 'grommet/components/icons/base/Edit';

// Custom Components
import EditProfile from './EditProfile';
import SocialIcons from './SocialIcons';
import { changeProfile } from './../../actions/ProfileActions';

class ProfileBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideModal: true,
      hideImageURL: true,
    };
    this.hideModal = this.hideModal.bind(this);
    this.hideImageURL = this.hideImageURL.bind(this);
  }

  hideModal() {
    this.setState({
      hideModal: !this.state.hideModal
    });
  }

  hideImageURL() {
    this.setState({
      hideImageURL: !this.state.hideImageURL
    });
  }

  render() {
    const descriptionBox =
      (
        <div>
          <Heading tag="h3">
            {this.props.userProfile.profession}
          </Heading>
          {this.props.userProfile.bio}
        </div>
      );
    return (
      <Tile
        full={false}
        align="center"
        style={{ boxShadow: '0px 0px 13px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Image
          size="medium"
          style={{ maxWidth: 384, maxHeight: 280, objectFit: 'cover' }}
          src={this.props.userProfile.profile_pic}
        />
        <Card
          heading={this.props.userProfile.name}
          contentPad="medium"
          description={descriptionBox}
        />
        <Box
          direction="row"
          justify="between"
          style={{ minWidth: 384 }}
          size="medium"
          responsive={false}
        >
          {
            this.props.isProfileOwner &&
            <Box>
              <Anchor
                icon={<EditIcon id="edit" />}
                onClick={this.hideModal}
              />
              <EditProfile
                hideModal={this.hideModal}
                hideImageURL={this.hideImageURL}
                hidden={this.state.hideModal}
                imageURLHidden={this.state.hideImageURL}
              />
              <SocialIcons />
            </Box>
          }
        </Box>
      </Tile>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveChanges: (changes, profile) => dispatch(changeProfile(changes, profile)),
  };
};

const mapStateToProps = (state) => {
  return {
    userProfile: state.userProfile
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBox);
