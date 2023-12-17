
    self.addEventListener('push', function(e) {
        const data = e.data.json();
        self.registration.showNotification(
            data.title,
            {
                icon: "/icon.jpg",
                body: data.body,
            }
        );
    })

    self.addEventListener("notificationclick", (event) => {
        console.log("On notification click: ", event.notification.tag);
        event.notification.close();
      
        // This looks to see if the current is already open and
        // focuses if it is
        event.waitUntil(
          clients
            .matchAll({
              type: "window",
            })
            .then((clientList) => {
              for (const client of clientList) {
                if (client.url === "/" && "focus" in client) return client.focus();
              }
              if (clients.openWindow) return clients.openWindow("/");
            }),
        );
      });
