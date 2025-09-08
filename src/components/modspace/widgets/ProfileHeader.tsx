import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ModSpace } from '../../../types/modspace.types';
import { RootState } from '../../../store';
import { setEditMode } from '../../../store/modspaceSlice';
import { useOrientation } from '../../../utils/useOrientation';
import Icon from '../../common/Icon';

interface ProfileHeaderProps {
  modspace: ModSpace;
}

const { width: screenWidth } = Dimensions.get('window');

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ modspace }) => {
  const dispatch = useDispatch();
  const { isEditMode } = useSelector((state: RootState) => state.modspace);
  const { isPortrait } = useOrientation();

  const handleEditProfile = () => {
    dispatch(setEditMode(!isEditMode));
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const headerHeight = isPortrait ? 200 : 150;
  const avatarSize = isPortrait ? 100 : 80;

  return (
    <View style={[styles.container, { minHeight: headerHeight }]}>
      {/* Cover Image */}
      <ImageBackground
        source={modspace.coverImage ? { uri: modspace.coverImage } : undefined}
        style={[styles.coverImage, { height: headerHeight * 0.6 }]}
        imageStyle={styles.coverImageStyle}
      >
        {!modspace.coverImage && (
          <View style={[styles.defaultCover, { height: headerHeight * 0.6 }]}>
            <Icon name="book" size={48} color="rgba(255, 255, 255, 0.8)" />
          </View>
        )}
        
        {/* Edit Button */}
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Icon 
            name={isEditMode ? 'check' : 'edit'} 
            size="sm" 
            color="white" 
          />
        </TouchableOpacity>
      </ImageBackground>

      {/* Profile Info */}
      <View style={[styles.profileInfo, { paddingTop: avatarSize / 2 + 10 }]}>
        
        {/* Avatar */}
        <View style={[
          styles.avatarContainer, 
          { 
            width: avatarSize, 
            height: avatarSize,
            top: -avatarSize / 2,
          }
        ]}>
          {modspace.avatar ? (
            <ImageBackground
              source={{ uri: modspace.avatar }}
              style={styles.avatar}
              imageStyle={styles.avatarImageStyle}
            />
          ) : (
            <View style={[styles.defaultAvatar, { 
              width: avatarSize, 
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }]}>
              <Text style={[styles.avatarText, { fontSize: avatarSize * 0.3 }]}>
                {getInitials(modspace.displayName)}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{modspace.displayName}</Text>
          <Text style={styles.username}>@{modspace.username}</Text>
          
          {modspace.bio && (
            <Text style={styles.bio}>{modspace.bio}</Text>
          )}

          {/* Join Date & Last Active */}
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size="xs" color="#999" style={{ marginRight: 6 }} />
              <Text style={styles.metaText}>
                Joined {formatJoinDate(modspace.stats.joinDate)}
              </Text>
            </View>
            {modspace.privacy.showLastActive && (
              <View style={styles.metaItem}>
                <Icon name="active" size="xs" color="#34C759" style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>
                  Active recently
                </Text>
              </View>
            )}
          </View>

          {/* Social Links */}
          {modspace.socialLinks.length > 0 && (
            <View style={styles.socialLinksContainer}>
              {modspace.socialLinks
                .filter(link => link.isVisible)
                .slice(0, 3) // Show max 3 social links
                .map((link) => (
                  <TouchableOpacity 
                    key={link.id} 
                    style={styles.socialLinkButton}
                  >
                    <View style={styles.socialLinkContent}>
                      <Icon name={getSocialIconName(link.platform)} size="sm" color="#666" style={{ marginRight: 4 }} />
                      <Text style={styles.socialLinkText}>
                        {link.displayName || link.platform}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </View>

      {/* Stats Section - Outside of profileInfo to span full width */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {modspace.stats.totalEntries}
          </Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {modspace.stats.totalViews}
          </Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {modspace.stats.followers}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {modspace.stats.following}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>
    </View>
  );
};

// Helper function to get social platform icon names
const getSocialIconName = (platform: string) => {
  const iconNames: Record<string, any> = {
    instagram: 'instagram',
    twitter: 'twitter',
    tiktok: 'tiktok',
    youtube: 'youtube',
    website: 'website',
    other: 'link',
  };
  return iconNames[platform] || iconNames.other;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  coverImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  defaultCover: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: 'white',
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    position: 'relative',
  },
  avatarContainer: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarImageStyle: {
    borderRadius: 50,
  },
  defaultAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 0,
    alignItems: 'flex-start',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaInfo: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialLinkButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  socialLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLinkText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ProfileHeader;