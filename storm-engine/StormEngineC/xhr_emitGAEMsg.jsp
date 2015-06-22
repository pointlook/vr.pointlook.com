<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ page import="java.io.IOException" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.logging.Logger" %>
<%@ page import="javax.servlet.http.*" %>

<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.HashSet" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Arrays" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Iterator" %>

<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.google.appengine.api.datastore.DatastoreServiceFactory" %>
<%@ page import="com.google.appengine.api.datastore.DatastoreService" %>
<%@ page import="com.google.appengine.api.datastore.Query" %>
<%@ page import="com.google.appengine.api.datastore.PreparedQuery" %>
<%@ page import="com.google.appengine.api.datastore.Entity" %>
<%@ page import="com.google.appengine.api.datastore.FetchOptions" %>
<%@ page import="com.google.appengine.api.datastore.Key" %>
<%@ page import="com.google.appengine.api.datastore.KeyFactory" %>

<%@ page import="javax.jdo.PersistenceManager" %>
<%@ page import="storm.PMF" %>

<%@ page import="storm.StormChannel" %>

<%
UserService userService = UserServiceFactory.getUserService();
User user = userService.getCurrentUser();

DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
%>





<%
Query q = new Query("StormChannel");
PreparedQuery pq = datastore.prepare(q);

int num = pq.countEntities(FetchOptions.Builder.withDefaults());
if(num > 0) {
	for (Entity ent : pq.asIterable()) {
		Key theKey = ent.getKey();
		if(ent.getProperty("scene").equals(request.getParameter("scene"))) {
			PersistenceManager pm = PMF.get().getPersistenceManager();
			StormChannel stormChannel = pm.getObjectById(StormChannel.class, theKey);
			
			if(request.getParameter("newNetNode") != null && request.getParameter("newNetNode").equals("true")) {
				stormChannel.newNetNode(request.getParameter("netID"), request.getParameter("netNickname")); 
			}
			if(request.getParameter("getNetNodes") != null && request.getParameter("getNetNodes").equals("true")) {
				stormChannel.getNetNodes(request.getParameter("netID"));   
			}
			if(request.getParameter("dataclient") != null && request.getParameter("dataclient").equals("true")) {
				stormChannel.dataclient(request.getParameter("netID"), request.getParameter("netNickname"), request.getParameter("param1"));
			}   
			if(request.getParameter("disconnect") != null && request.getParameter("disconnect").equals("true")) {
				stormChannel.disconnect(request.getParameter("netID"), request.getParameter("netNickname")); 
			}  
			
			pm.close();
			break;
		}
	}
}
%>