
package com.example.openticket.dto;

public class Event {
	private Long id;
	private String image;
	private String address;
	private String eventStart;
	private String title;

	public Event() {}

	public Event(Long id, String image, String address, String eventStart, String title) {
		this.id = id;
		this.image = image;
		this.address = address;
		this.eventStart = eventStart;
		this.title = title;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getEventStart() {
		return eventStart;
	}

	public void setEventStart(String eventStart) {
		this.eventStart = eventStart;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
}
