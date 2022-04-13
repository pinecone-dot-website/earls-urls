const { api_post } = require('./api');

const mockRequest = (body) => ({
    body,
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Check API Controller", () => {
    test('Should return 200 with valid url', async () => {
        const input_url = 'https://rack.and.pinecone.website/';
        const req = mockRequest({ url: input_url });
        const res = mockResponse();

        await api_post(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            input_url: input_url,
            success: true
        });
    });

    test('Should return 400 with missing url parameter', async () => {
        const req = mockRequest();
        const res = mockResponse();

        await api_post(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            'error': 'Missing url param',
            'success': false,
        });
    });

    test('Should return 422 with invalid url parameter', async () => {
        const input_url = 'javascript:void(0)';
        const req = mockRequest({ url: input_url });
        const res = mockResponse();

        await api_post(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            'error': 'Url not valid',
            'success': false,
        });
    });
});