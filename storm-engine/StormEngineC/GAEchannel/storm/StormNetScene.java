package storm;

import javax.servlet.http.*;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

import com.google.appengine.api.channel.ChannelMessage;
import com.google.appengine.api.channel.ChannelService;
import com.google.appengine.api.channel.ChannelServiceFactory;

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;


import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;
import javax.jdo.JDOHelper;
import javax.jdo.PersistenceManager;
import javax.jdo.PersistenceManagerFactory;

public class StormNetScene {
	private String scene;
	private String token;
	
	public StormNetScene() {
		
	}
	
	public void setName(String scene) {
		this.scene = scene;
	}
	public void ini() {    
		PersistenceManager pm = PMF.get().getPersistenceManager();

		String gameKey = null;
		StormChannel stormChannel = null;
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Query q = new Query("StormChannel");
		PreparedQuery pq = datastore.prepare(q);
		int num = pq.countEntities(FetchOptions.Builder.withDefaults());
		if(num > 0) {
			for(Entity ent : pq.asIterable()) {
				Key theKey = ent.getKey();
				if(ent.getProperty("scene").equals(this.scene)) {
					gameKey = KeyFactory.keyToString(theKey);
					break;
				}
			}
		}
		
		if(gameKey != null) {
			stormChannel = pm.getObjectById(StormChannel.class, KeyFactory.stringToKey(gameKey));
		} else {
			stormChannel = new StormChannel(this.scene);
			pm.makePersistent(stormChannel);
			gameKey = KeyFactory.keyToString(stormChannel.getKey());
		}
				
		pm.close();

		ChannelService channelService = ChannelServiceFactory.getChannelService();
		
		UserService userService = UserServiceFactory.getUserService();
		User user = userService.getCurrentUser();
		this.token = channelService.createChannel(stormChannel.getChannelKey(user.getUserId()));   
			
		//this.token = channelService.createChannel( gameKey );   
		//token = channelService.createChannel( KeyFactory.keyToString(stormChannel.getKey()) );  
		
		
	}
	public String getToken() {
		return this.token;
	}
}