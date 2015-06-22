package storm;

import javax.servlet.http.*;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;


import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Iterator;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

@PersistenceCapable
public class StormChannel {
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	@Persistent
	private String scene;  
	
	@Persistent
	public ArrayList<String> arrNetNodesIds;
	
	@Persistent
	public ArrayList<String> arrNetNodesNicknames; 
	
	@Persistent
	public ArrayList<Boolean> arrNetNodesStatus; 
	
	public StormChannel(String scene) {
		this.scene = scene;
	}
	
	 
	public Key getKey() {
		return key;
	}
	public String getChannelKey(String user) {
		String channelkey = user + KeyFactory.keyToString(key);
		int length = channelkey.length();
		if(length > 64){
			channelkey = channelkey.substring(length - 64, length);  
		}
		return channelkey;
	}
	 
	public void newNetNode(String userID, String userNickname) { 
		//this.board = "ok";
		this.arrNetNodesIds.add(userID);
		this.arrNetNodesNicknames.add(userNickname);
		this.arrNetNodesStatus.add(true);
		
		String str = "[";
		str += "{\"newconnection\":\""+userID+"\",\"netNickname\":\""+userNickname+"\"}";
		str += "]";
		
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		for(int n = 0; n < this.arrNetNodesIds.size(); n++) {
			String channelKey = getChannelKey(this.arrNetNodesIds.get(n));
			channelService.sendMessage(new ChannelMessage(channelKey, str));
		}
		
	}
	public void getNetNodes(String userID) { 
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		for(int n = 0; n < this.arrNetNodesIds.size(); n++) {
			String str = "[";
			str += "{\"getNetNodesResponse\":\""+this.arrNetNodesIds.get(n)+"\",\"netNickname\":\""+this.arrNetNodesNicknames.get(n)+"\"}";
			str += "]";			
			
			String channelKey = getChannelKey(userID);
			channelService.sendMessage(new ChannelMessage(channelKey, str));
		}
	}
	public void dataclient(String userID, String userNickname, String param1) {
		String str = "[";
		str += "{\"serverNodeData\":\"true\",\"netID\":\""+userID+"\",\"netNickname\":\""+userNickname+"\",\"param1\":\""+param1+"\"}";
		str += "]";
		
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		for(int n = 0; n < this.arrNetNodesIds.size(); n++) {		
			String channelKey = getChannelKey(this.arrNetNodesIds.get(n));
			channelService.sendMessage(new ChannelMessage(channelKey, str));
		}
	}
	public void disconnect(String userID, String userNickname) {
		String str = "[";
		str += "{\"disconnectNetNode\":\"true\",\"netID\":\""+userID+"\",\"netNickname\":\""+userNickname+"\"}";
		str += "]";
		
		ChannelService channelService = ChannelServiceFactory.getChannelService();
		for(int n = 0; n < this.arrNetNodesIds.size(); n++) {
			String channelKey = getChannelKey(this.arrNetNodesIds.get(n));
			channelService.sendMessage(new ChannelMessage(channelKey, str));
		}
		
		int idxToDel = 0;
		for(int n = 0; n < this.arrNetNodesIds.size(); n++) { 	
			if(this.arrNetNodesIds.get(n).equals(userID)) {
				idxToDel = n;
			}
		}
		this.arrNetNodesIds.remove(idxToDel);   
		this.arrNetNodesNicknames.remove(idxToDel);   
		this.arrNetNodesStatus.remove(idxToDel);  
	}
	
	
	
	

}
