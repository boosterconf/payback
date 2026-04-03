export type User = {
	id: string;
	name: string;
	avatar: string;
	fikenContactId: number;
};

export type Env = {
	Variables: {
		user: User;
	};
};

export type SlackTokenResponse = {
	ok?: boolean;
	id_token?: string;
	error?: string;
};

export type SlackIdTokenPayload = {
	sub: string;
	name?: string;
	picture?: string;
	email?: string;
	nonce?: string;
};
