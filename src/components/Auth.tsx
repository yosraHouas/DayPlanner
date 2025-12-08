import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Calendar, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isForgotPassword) {
      const redirectUrl = import.meta.env.VITE_SITE_URL ||
                          `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '');

      console.log('Redirect URL for password reset:', redirectUrl);
      console.log('VITE_SITE_URL:', import.meta.env.VITE_SITE_URL);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte mail.');
        setEmail('');
      }
    } else if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } else {
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Compte créé ! Un courriel de confirmation a été envoyé. Cliquez sur le lien pour activer votre compte');
        setIsLogin(true);
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Calendar className="h-12 w-12 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Smart Planning Tool
        </h1>

        <p className="text-gray-600 text-center mb-8">
          {isForgotPassword ? 'Réinitialisez votre mot de passe' : isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jean"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dupont"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 6 caractères
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Chargement...'
            ) : isForgotPassword ? (
              <>
                <KeyRound className="h-5 w-5" />
                Envoyer le lien
              </>
            ) : isLogin ? (
              <>
                <LogIn className="h-5 w-5" />
                Se connecter
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Créer un compte
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {isLogin && !isForgotPassword && (
            <button
              onClick={() => {
                setIsForgotPassword(true);
                setIsLogin(false);
                setError(null);
                setMessage(null);
                setPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium block w-full"
            >
              Mot de passe oublié ?
            </button>
          )}
          <button
            onClick={() => {
              if (isForgotPassword) {
                setIsForgotPassword(false);
                setIsLogin(true);
              } else {
                setIsLogin(!isLogin);
              }
              setError(null);
              setMessage(null);
              setFirstName('');
              setLastName('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isForgotPassword
              ? 'Retour à la connexion'
              : isLogin
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}
