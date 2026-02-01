import { useMutation, useQuery } from "convex/react";
import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import Seo from "../../components/Seo";
import FriendActionCard from "../../components/friends/FriendActionCard";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { verifyToken } from "../../lib/jwt";

type PendingRequest = {
  requestId: Id<"friendRequests">;
  sender: {
    _id: Id<"users">;
    firstName?: string;
    lastName?: string;
    username?: string;
    avatarUrl?: string;
    email?: string;
  };
  status: string;
};

type FriendsPageProps = {
  userId: Id<"users">;
};

export default function FriendsPage({ userId }: FriendsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [friendFilter, setFriendFilter] = useState("");
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [requestLoading, setRequestLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [friendLoading, setFriendLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const friends = useQuery(api.friends.listFriends, { userId }) ?? [];
  const requests = (useQuery(api.friends.listPendingRequests, { userId }) ??
    []) as PendingRequest[];
  const sentRequestIds =
    useQuery(api.friends.listSentRequests, { userId }) ?? [];
  const searchResults =
    useQuery(
      api.friends.searchUsers,
      debouncedQuery.length > 2 ? { userId, keyword: debouncedQuery } : "skip",
    ) ?? [];

  const acceptRequest = useMutation(api.friends.acceptRequest);
  const declineRequest = useMutation(api.friends.declineRequest);
  const sendRequest = useMutation(api.friends.sendRequest);
  const removeFriend = useMutation(api.friends.removeFriend);

  const requestCount = requests.length;

  const handleSendRequest = async (receiverId: Id<"users">) => {
    if (sending[receiverId] || sentRequests[receiverId]) return;
    setSending((prev) => ({ ...prev, [receiverId]: true }));
    try {
      await sendRequest({ userId, receiverId });
      setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
      setSearchQuery("");
    } catch {
      setSentRequests((prev) => ({ ...prev, [receiverId]: true }));
    } finally {
      setSending((prev) => ({ ...prev, [receiverId]: false }));
    }
  };

  const handleAccept = async (requestId: Id<"friendRequests">) => {
    setRequestLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await acceptRequest({ userId, requestId });
    } finally {
      setRequestLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDecline = async (requestId: Id<"friendRequests">) => {
    setRequestLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await declineRequest({ userId, requestId });
    } finally {
      setRequestLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRemoveFriend = async (friendId: Id<"users">) => {
    if (!window.confirm("Remove this friend?")) return;
    setFriendLoading((prev) => ({ ...prev, [friendId]: true }));
    try {
      await removeFriend({ userId, friendUserId: friendId });
    } finally {
      setFriendLoading((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const emptySearch = debouncedQuery.length <= 2;

  const friendIdSet = useMemo(
    () => new Set(friends.map((friend) => String(friend?._id)).filter(Boolean)),
    [friends],
  );

  const sentIdSet = useMemo(() => {
    const ids = sentRequestIds.map((id) => String(id));
    const optimistic = Object.entries(sentRequests)
      .filter(([, value]) => value)
      .map(([id]) => id);
    return new Set([...ids, ...optimistic]);
  }, [sentRequestIds, sentRequests]);

  const showSearchResults = useMemo(() => {
    if (emptySearch) return [];
    return searchResults.filter((user) => !friendIdSet.has(String(user._id)));
  }, [emptySearch, searchResults, friendIdSet]);

  const filteredFriends = useMemo(() => {
    const needle = friendFilter.trim().toLowerCase();
    if (!needle) return friends;
    return friends.filter((friend) => {
      const name = `${friend.firstName || ""} ${friend.lastName || ""}`.trim();
      const username = friend.username || "";
      const email = friend.email || "";
      return [name, username, email].some((value) =>
        value.toLowerCase().includes(needle),
      );
    });
  }, [friendFilter, friends]);

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Connections" description="Manage your friends." noIndex />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <PageHeader title="Connections" subtitle="Manage your social graph" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {requestCount > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
                <div>
                  <h2 className="text-h2 text-text-primary">Needs attention</h2>
                  <p className="text-sm text-text-secondary">
                    You have {requestCount} incoming request
                    {requestCount > 1 ? "s" : ""}.
                  </p>
                </div>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <FriendActionCard
                      key={request.requestId}
                      user={request.sender}
                      variant="request"
                      isLoading={Boolean(requestLoading[request.requestId])}
                      onAction={(action) => {
                        if (action === "accept") {
                          void handleAccept(request.requestId);
                        }
                        if (action === "decline") {
                          void handleDecline(request.requestId);
                        }
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div>
                <h2 className="text-h2 text-text-primary">My friends</h2>
                <p className="text-sm text-text-secondary">
                  Keep up with everyone you’re connected to.
                </p>
              </div>
              <input
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
                placeholder="Filter friends..."
                value={friendFilter}
                onChange={(event) => setFriendFilter(event.target.value)}
              />
              <div className="space-y-3">
                {filteredFriends.length === 0 ? (
                  <div className="text-sm text-text-secondary">
                    You haven’t added any friends yet.
                  </div>
                ) : (
                  filteredFriends.map((friend) => (
                    <FriendActionCard
                      key={friend._id}
                      user={friend}
                      variant="friend"
                      isLoading={Boolean(friendLoading[friend._id])}
                      onAction={() => void handleRemoveFriend(friend._id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div>
              <h2 className="text-h2 text-text-primary">Discover</h2>
              <p className="text-sm text-text-secondary">
                Find new people to connect with.
              </p>
            </div>
            <input
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
              placeholder="Search for username..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <div className="space-y-3">
              {!emptySearch && showSearchResults.length === 0 && (
                <div className="text-sm text-text-secondary">
                  No matching users.
                </div>
              )}
              {showSearchResults.map((user) => (
                <FriendActionCard
                  key={user._id}
                  user={user}
                  variant="search-result"
                  requestStatus={
                    sentIdSet.has(String(user._id)) ? "pending" : "none"
                  }
                  isLoading={Boolean(sending[user._id])}
                  onAction={() => void handleSendRequest(user._id)}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return {
    props: {
      isAuthenticated: true,
      userId: payload.userId as Id<"users">,
    },
  };
};
