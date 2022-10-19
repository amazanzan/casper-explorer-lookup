export function safelyAppendUrlParameter(url, parameterKey, parameterValue) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${parameterKey}=${parameterValue}`;
}
